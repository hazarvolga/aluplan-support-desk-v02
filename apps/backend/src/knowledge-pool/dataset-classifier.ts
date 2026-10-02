import * as path from 'path';

export const DATASET_CATEGORY_BY_SLUG = {
    'license-activation': 'License & Activation',
    'license-server-codemeter': 'License Server & CodeMeter',
    'installation-setup': 'Installation & Setup',
    'performance-hardware': 'Performance & Hardware',
    'network-workgroup': 'Network & Workgroup',
    'export-import-ifc-dwg': 'Export Import & IFC DWG',
    'allplan-share-cloud': 'Allplan Share & Cloud',
    'project-data-management': 'Project Data Management',
    'turkish-local-support': 'Turkish Local Support',
    'release-package-info': 'Release Package Info',
    'manuals-tutorials': 'Manuals & Tutorials',
    'review-backlog': 'Review Backlog',
} as const;

export type DatasetCategory = typeof DATASET_CATEGORY_BY_SLUG[keyof typeof DATASET_CATEGORY_BY_SLUG];
export type DatasetSourceClass = 'support' | 'manual' | 'review';
export type LicenseVersionFamily =
    | 'legacy_pre_2016'
    | 'codemeter_2016_2023'
    | 'cloud_2024'
    | 'connect_2025'
    | 'connect_2026'
    | 'unknown';

export interface DatasetFileClassification {
    language: 'tr' | 'en' | 'de';
    category: DatasetCategory;
    categorySlug: keyof typeof DATASET_CATEGORY_BY_SLUG;
    sourceClass: DatasetSourceClass;
    canonicalSource: string;
    importBatch: string;
    versionFamily: LicenseVersionFamily;
    licenseEra: LicenseVersionFamily;
    versionRange: string;
    licenseMethods: string[];
    scenarios: string[];
    requiresHumanReview: boolean;
}

const TURKISH_CHARS = /[çğıöşüİÇĞÖŞÜ]/;

const hasAny = (value: string, needles: string[]): boolean =>
    needles.some((needle) => value.includes(needle));

const normalizedPathSegments = (filePath: string): string[] =>
    filePath
        .split(/[\\/]+/)
        .map((segment) => segment.toLowerCase())
        .filter(Boolean);

const inferLanguage = (filePath: string, fileName: string): 'tr' | 'en' | 'de' => {
    const lowerPath = filePath.toLowerCase();
    const lowerName = fileName.toLowerCase();
    const segments = normalizedPathSegments(filePath);

    if (
        segments.includes('tr') ||
        lowerName.includes('faq_tr') ||
        lowerName.includes('faq-tr') ||
        lowerName.includes('sss_') ||
        lowerName.startsWith('sss') ||
        TURKISH_CHARS.test(fileName)
    ) {
        return 'tr';
    }

    if (
        segments.includes('de') ||
        lowerName.includes('faq_de') ||
        lowerName.includes('faq-de') ||
        /(^|[-_])de([-_.]|$)/.test(lowerName) ||
        hasAny(lowerPath, [
            'lizenz',
            'grafikkarten',
            'projekt',
            'ueber',
            'über',
            'fuer',
            'für',
            'rechner',
            'echtzeit',
            'blockiert',
            'wenn',
            'nicht',
            'keine',
            'werden',
        ])
    ) {
        return 'de';
    }

    if (
        segments.includes('en') ||
        lowerName.includes('faq_en') ||
        lowerName.includes('faq-en') ||
        /(^|[-_])en([-_.]|$)/.test(lowerName) ||
        hasAny(lowerPath, ['english', 'license', 'requirements', 'installation', 'workgroup', 'export', 'import'])
    ) {
        return 'en';
    }

    return 'tr';
};

const categoryFromPath = (filePath: string): keyof typeof DATASET_CATEGORY_BY_SLUG | null => {
    const segments = normalizedPathSegments(filePath);
    const knownSlug = segments.find((segment) => segment in DATASET_CATEGORY_BY_SLUG);
    return (knownSlug as keyof typeof DATASET_CATEGORY_BY_SLUG | undefined) ?? null;
};

const inferCategorySlug = (filePath: string, fileName: string): keyof typeof DATASET_CATEGORY_BY_SLUG => {
    const slugFromPath = categoryFromPath(filePath);
    if (slugFromPath) return slugFromPath;

    const lower = `${filePath} ${fileName}`.toLowerCase();

    if (hasAny(lower, ['case-study', 'case_study', 'casestudy', 'whitepaper', 'brochure', 'infographic', 'standards-', 'tbdy', 'scia', 'frilo'])) {
        return 'review-backlog';
    }

    if (hasAny(lower, ['manual', 'elearning', 'tutorial', 'tutl', 'basics', 'sbs', 'documentation', 'architecturetutl', 'engineeringtutl', 'visualscripting', 'steps'])) {
        return 'manuals-tutorials';
    }

    // Approved licensing guides can arrive through the UI upload path without
    // a dataset category folder. Keep their explicit file-name markers ahead
    // of generic cloud/review rules so version metadata is not lost.
    if (hasAny(lower, [
        'allplan-id',
        'allplan id',
        'connect-2',
        'connect 2',
        'legacy-2015',
        'nemslock',
        'softlock',
        'hardlock',
        'client-id',
        'client id',
        'cd-key',
        'cd key',
    ])) {
        return 'license-activation';
    }

    if (hasAny(lower, ['license server', 'license_server', 'license-server', 'lizenzserver', 'codemeter', 'licensing service', 'vpn'])) {
        return 'license-server-codemeter';
    }

    if (hasAny(lower, ['license', 'lizenz', 'lisans', 'product_ke', 'product key', 'aktivieren', 'activation', 'register', 'softlock'])) {
        return 'license-activation';
    }

    if (hasAny(lower, ['grafikkarten', 'graphics', 'graphic', 'performance', 'slow', 'langsam', 'geschwindigkeit', 'scanner', 'virus'])) {
        return 'performance-hardware';
    }

    if (hasAny(lower, ['install', 'setup', 'system-requirements', 'system_requirements', 'systemvoraussetzungen', 'silent-installation'])) {
        return 'installation-setup';
    }

    if (hasAny(lower, ['workgroup', 'network', 'netzwerk', 'server', 'loopback', 'home-office', 'home office', 'name resolution', 'isim cozumleme', 'isim çözümleme', 'dns'])) {
        return 'network-workgroup';
    }

    if (hasAny(lower, ['export', 'import', 'ifc', 'dwg', 'data-exchange', 'data exchange', 'datenaustausch'])) {
        return 'export-import-ifc-dwg';
    }

    if (hasAny(lower, ['share', 'cloud', 'bimplus'])) {
        return 'allplan-share-cloud';
    }

    if (hasAny(lower, ['paket', 'package', 'version', 'new-features', 'new_features'])) {
        return 'release-package-info';
    }

    if (hasAny(lower, ['project', 'projekt', 'backup', 'archive', 'datensicherung'])) {
        return 'project-data-management';
    }

    if (hasAny(lower, ['sss', 'hakedis', 'hakediş', 'kayıtlandırma', 'kayitlandirma'])) {
        return 'turkish-local-support';
    }

    return 'review-backlog';
};

const inferSourceClass = (categorySlug: keyof typeof DATASET_CATEGORY_BY_SLUG): DatasetSourceClass => {
    if (categorySlug === 'manuals-tutorials') return 'manual';
    if (categorySlug === 'review-backlog') return 'review';
    return 'support';
};

const inferImportBatch = (filePath: string): string => {
    const segments = normalizedPathSegments(filePath);
    if (segments.includes('knowledge-pool')) return 'ui-upload';

    const explicitBatch = segments.find((segment) => segment === 'pilot' || /^batch-\d+$/.test(segment));
    return explicitBatch ?? 'dataset-local';
};

const inferLicenseProfile = (
    filePath: string,
    fileName: string,
    categorySlug: keyof typeof DATASET_CATEGORY_BY_SLUG,
): Pick<DatasetFileClassification, 'versionFamily' | 'versionRange' | 'licenseMethods' | 'scenarios' | 'requiresHumanReview'> => {
    const segments = normalizedPathSegments(filePath);
    const rootIndex = segments.findIndex((segment) => segment === 'dataset' || segment === 'knowledge-pool');
    const relativePath = rootIndex >= 0 ? segments.slice(rootIndex).join(' ') : fileName;
    const lower = `${relativePath} ${fileName}`.toLowerCase();
    const isLicenseContent = categorySlug === 'license-activation' || categorySlug === 'license-server-codemeter';
    if (!isLicenseContent) {
        return {
            versionFamily: 'unknown',
            versionRange: 'unknown',
            licenseMethods: [],
            scenarios: [],
            requiresHumanReview: false,
        };
    }

    if (hasAny(lower, ['2026', 'connect-2-management', 'reservation', 'reservierung'])) {
        return {
            versionFamily: 'connect_2026',
            versionRange: '2026+',
            licenseMethods: ['ALLPLAN Connect 2.0', 'user and group management', 'seat reservation'],
            scenarios: ['user invitation', 'group assignment', 'seat reservation'],
            requiresHumanReview: true,
        };
    }
    if (hasAny(lower, ['2025', 'connect-2', 'connect 2'])) {
        return {
            versionFamily: 'connect_2025',
            versionRange: '2025',
            licenseMethods: ['ALLPLAN Connect 2.0', 'organization invitation', 'seat management'],
            scenarios: ['organization invite', 'seat assignment'],
            requiresHumanReview: true,
        };
    }
    if (hasAny(lower, ['2024', 'allplan-id', 'allplan id', 'cloud'])) {
        return {
            versionFamily: 'cloud_2024',
            versionRange: '2024-2024-2',
            licenseMethods: ['ALLPLAN ID', 'cloud licensing', 'offline activation'],
            scenarios: ['cloud sign-in', 'offline activation', 'license migration'],
            requiresHumanReview: true,
        };
    }
    if (hasAny(lower, ['2016', '2023', 'codemeter', 'product-key', 'product key', 'license-server'])) {
        return {
            versionFamily: 'codemeter_2016_2023',
            versionRange: '2016-2023',
            licenseMethods: ['CodeMeter', 'Product Key', 'license server'],
            scenarios: ['activation', 'server setup', 'license return or borrow'],
            requiresHumanReview: true,
        };
    }
    if (hasAny(lower, ['2015', 'legacy', 'nemslock', 'softlock', 'hardlock', 'client-id', 'client id', 'cd-key', 'cd key'])) {
        return {
            versionFamily: 'legacy_pre_2016',
            versionRange: '<=2015',
            licenseMethods: ['NemSLock', 'Softlock', 'Hardlock', 'Client ID or CD Key'],
            scenarios: ['activation', 'license transfer'],
            requiresHumanReview: true,
        };
    }
    return {
        versionFamily: 'unknown',
        versionRange: 'unknown',
        licenseMethods: [],
        scenarios: ['license support'],
        requiresHumanReview: true,
    };
};

export const classifyDatasetFile = (filePath: string): DatasetFileClassification => {
    const fileName = path.basename(filePath);
    const categorySlug = inferCategorySlug(filePath, fileName);
    const ext = path.extname(fileName).replace('.', '').toLowerCase() || 'unknown';
    const licenseProfile = inferLicenseProfile(filePath, fileName, categorySlug);

    return {
        language: inferLanguage(filePath, fileName),
        category: DATASET_CATEGORY_BY_SLUG[categorySlug],
        categorySlug,
        sourceClass: inferSourceClass(categorySlug),
        canonicalSource: ext,
        importBatch: inferImportBatch(filePath),
        ...licenseProfile,
        licenseEra: licenseProfile.versionFamily,
    };
};
