import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

type GraphicsCardInfo = {
    name: string;
    vram?: string;
    ram?: string;
    resolution?: string;
    driverDate?: string;
    driverVersion?: string;
    openglVersion?: string;
};

@Injectable()
export class HotinfoParserService {
    private readonly logger = new Logger(HotinfoParserService.name);
    private readonly parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            parseTagValue: true,
        });
    }

    /**
     * Parse the .hxl XML string and extract comprehensive system information.
     */
    parseHotinfo(xmlString: string) {
        try {
            const jsonObj = this.parser.parse(xmlString);

            const hotinfo = jsonObj?.hotinfo;
            if (!hotinfo) {
                return null;
            }

            const cadinfo = hotinfo.cadinfo;
            const system = hotinfo.system;

            // ── Allplan Version ──
            let allplanVersion = 'Unknown';
            let allplanEdition = '';
            let allplanHotfix = '';
            let allplanBuildId = '';
            if (cadinfo?.allplanversion?.item) {
                const items = Array.isArray(cadinfo.allplanversion.item) ? cadinfo.allplanversion.item : [cadinfo.allplanversion.item];
                const versionItem = items.find((i: any) => i['@_name'] === 'Version');
                const editionItem = items.find((i: any) => i['@_name'] === 'Edition');
                const hotfixItem = items.find((i: any) => i['@_name'] === 'Hotfix' || i['@_name'] === 'Patch');
                const buildIdItem = items.find((i: any) => i['@_name'] === 'Build-ID');

                if (versionItem) allplanVersion = this.extractValue(versionItem);
                if (editionItem) allplanEdition = this.extractValue(editionItem);
                if (hotfixItem) allplanHotfix = this.extractValue(hotfixItem);
                if (buildIdItem) allplanBuildId = this.extractValue(buildIdItem);
            }

            // ── License Info ──
            let licenseType = '';
            if (cadinfo?.license) {
                licenseType = cadinfo.license['@_type'] || cadinfo.license['@_name'] || this.extractValue(cadinfo.license) || '';
            }

            // ── Installed Modules ──
            let installedModules: string[] = [];
            if (cadinfo?.modules?.module) {
                const modules = Array.isArray(cadinfo.modules.module) ? cadinfo.modules.module : [cadinfo.modules.module];
                installedModules = modules
                    .map((m: any) => m['@_name'] || this.extractValue(m))
                    .filter(Boolean)
                    .slice(0, 20);
            } else if (cadinfo?.worksets?.workset) {
                const ws = Array.isArray(cadinfo.worksets.workset) ? cadinfo.worksets.workset : [cadinfo.worksets.workset];
                installedModules = ws
                    .map((w: any) => w['@_name'] || this.extractValue(w))
                    .filter(Boolean)
                    .slice(0, 20);
            }

            // ── Operating System ──
            let osVersion = 'Unknown';
            if (system?.platform) {
                const s = system.platform;
                osVersion = s['system-caption'] || s['@_name'] || this.extractValue(s) || 'Unknown';
                // If it's just "Windows" or similar, try to get more detail if available
                if (osVersion === 'Windows' && s['os-version']) {
                    osVersion = `Windows ${this.extractValue(s['os-version'])}`;
                }

                const buildStr = this.extractValue(s['build']);
                if (buildStr) {
                    const mappedVer = this.mapWindowsBuild(buildStr);
                    if (mappedVer) osVersion += ` (${mappedVer} - Build ${buildStr})`;
                    else osVersion += ` (Build ${buildStr})`;
                }
            }

            // ── CPU ──
            let cpu = 'Unknown';
            if (system?.processor) {
                cpu = system.processor['@_name'] || system.processor['cpu-name'] || this.extractValue(system.processor) || 'Unknown';
            }

            // ── GPU (Primary + Additional) ──
            let gpu = 'Unknown';
            let gpuDriverVersion = '';
            let openglVersion = '';
            let vram = '';
            let graphicsCards: GraphicsCardInfo[] = [];
            if (system?.video) {
                const v = system.video;
                graphicsCards = this.collectGraphicsCards(v);
                const gpuNames = graphicsCards.map((card) => card.name);
                if (gpuNames.length > 0) {
                    gpu = gpuNames.join(' / ');
                } else {
                    gpu = 'Unknown';
                }

                gpuDriverVersion = graphicsCards[0]?.driverVersion || '';
                openglVersion = graphicsCards[0]?.openglVersion || '';
                vram = graphicsCards[0]?.vram || graphicsCards[0]?.ram || '';
            }

            // ── RAM ──
            let ram = 'Unknown';
            const memTotal = system?.memory?.physical?.['@_total'] || system?.memory?.['@_total-physical'];
            if (memTotal) {
                const totalBytes = Number(memTotal);
                if (!isNaN(totalBytes)) {
                    ram = `${Math.round(totalBytes / (1024 * 1024 * 1024))} GB`;
                } else {
                    ram = String(memTotal);
                }
            }

            // ── Registry Paths ──
            let registryPaths: Record<string, string> = {};
            if (cadinfo?.registry?.item) {
                const items = Array.isArray(cadinfo.registry.item) ? cadinfo.registry.item : [cadinfo.registry.item];
                items.forEach((item: any) => {
                    const name = item['@_name'];
                    const val = this.extractValue(item);
                    if (name && val) registryPaths[name] = val;
                });
            }

            // ── Drive Info ──
            let drives: Array<{
                root: string;
                total: string;
                free: string;
                fs: string;
            }> = [];
            if (system?.drives?.drive) {
                const driveItems = Array.isArray(system.drives.drive) ? system.drives.drive : [system.drives.drive];
                drives = driveItems.map((d: any) => {
                    const total = Number(d.total || d['@_total']);
                    const free = Number(d.free || d['@_free']);
                    return {
                        root: d['@_root'] || d.root || '?',
                        total: !isNaN(total) ? `${Math.round(total / (1024 * 1024 * 1024))} GB` : '?',
                        free: !isNaN(free) ? `${Math.round(free / (1024 * 1024 * 1024))} GB` : '?',
                        fs: d.filesystem || d['@_filesystem'] || '?',
                    };
                });
            }

            // ── Printers ──
            let printers: string[] = [];
            let defaultPrinter = '';
            if (system?.printers?.printer) {
                const prnItems = Array.isArray(system.printers.printer) ? system.printers.printer : [system.printers.printer];
                printers = prnItems.map((p: any) => p['@_name'] || p.name).filter(Boolean);
                const def = prnItems.find((p: any) => p['@_default'] === 'yes' || p.default === 'yes');
                if (def) defaultPrinter = def['@_name'] || def.name;
            }

            // ── Display / Screen Resolution ──
            let screenResolution = '';
            if (system?.display) {
                const d = system.display;
                screenResolution = d['@_resolution'] || d['resolution'] || '';
                if (!screenResolution && d['@_width'] && d['@_height']) {
                    screenResolution = `${d['@_width']}x${d['@_height']}`;
                }
            }
            if (!screenResolution && system?.video) {
                screenResolution =
                    this.safeString(system.video['@_screen-resolution']) ||
                    this.safeString(system.video['screen-resolution']) ||
                    this.safeString(system.video['@_resolution']) ||
                    this.safeString(system.video['resolution']) ||
                    (system.video['@_screen-width'] && system.video['@_screen-height']
                        ? `${this.extractValue(system.video['@_screen-width'])}x${this.extractValue(system.video['@_screen-height'])}`
                        : '') ||
                    (system.video['screen-width'] && system.video['screen-height'] ? `${system.video['screen-width']}x${system.video['screen-height']}` : '');
            }
            graphicsCards = graphicsCards.map((card) => ({
                ...card,
                resolution: card.resolution || screenResolution || undefined,
            }));

            // ── Conflicting Processes ──
            let conflictingProcesses: string[] = [];
            if (system?.processes?.process) {
                const procs = Array.isArray(system.processes.process) ? system.processes.process : [system.processes.process];
                const knownConflicts = [
                    'onedrive.exe',
                    'dropbox.exe',
                    'googledrive.exe',
                    'box.exe',
                    'icloud.exe',
                    'ms-teams.exe',
                    'teams.exe',
                    'slack.exe',
                    'discord.exe',
                    'zoom.exe',
                    'anydesk.exe',
                    'teamviewer.exe',
                    'msmpeng.exe', // Windows Defender
                    'avp.exe',
                    'kaspersky.exe', // Kaspersky
                    'mcshield.exe',
                    'mcafee.exe', // McAfee
                    'avastsvc.exe',
                    'avastui.exe', // Avast
                    'avgnsx.exe',
                    'avg.exe', // AVG
                    'rtvscan.exe',
                    'symantec.exe', // Symantec
                    'tmproxy.exe',
                    'trendmicro.exe', // Trend Micro
                    'sentinelagent.exe',
                    'sentinelone.exe',
                    'csfalconservice.exe',
                    'crowdstrike.exe',
                    'ksweb.exe',
                    'ksafesvc.exe', // Kingsoft/Others
                ];
                conflictingProcesses = procs
                    .map((p: any) => this.extractValue(p).toLowerCase())
                    .filter((p: string) => knownConflicts.some((c) => p.includes(c)))
                    .map((p: string) => {
                        const parts = p.split(/[\\/]/);
                        return parts[parts.length - 1]; // get just the executable name
                    });
                conflictingProcesses = [...new Set(conflictingProcesses)]; // Remove duplicates
            }

            // ── Running Services (Antivirus/Security focus) ──
            const securityServices: string[] = [];
            if (system?.services?.windows?.service) {
                const svcs = Array.isArray(system.services.windows.service) ? system.services.windows.service : [system.services.windows.service];
                const securityKeywords = [
                    'defender',
                    'antivirus',
                    'firewall',
                    'security',
                    'protection',
                    'guard',
                    'agent',
                    'sentinel',
                    'crowdstrike',
                    'mcafee',
                    'kaspersky',
                    'avast',
                    'avg',
                    'koruma',
                    'güvenlik',
                    'savunma',
                    'denetim', // Turkish keywords
                ];
                svcs.forEach((s: any) => {
                    const name = (s['@_name'] || s['name'] || '').toLowerCase();
                    const status = s['@_status'] || s['status'];
                    if (status === '4' || status === 4) {
                        // 4 = Running
                        if (securityKeywords.some((k) => name.includes(k))) {
                            securityServices.push(s['@_name'] || s['name']);
                        }
                    }
                });
            }

            // ── Error Trace ──
            let errorTrace = '';
            if (cadinfo?.sec) {
                errorTrace += `SEC Hata: ${this.extractValue(cadinfo.sec)} | `;
            }
            if (jsonObj?.hotinfo?.traceinfo?.trace) {
                let traceStr = '';
                const traces = Array.isArray(jsonObj.hotinfo.traceinfo.trace) ? jsonObj.hotinfo.traceinfo.trace : [jsonObj.hotinfo.traceinfo.trace];
                traces.forEach((t: any) => {
                    traceStr += this.extractValue(t) + ' ';
                });
                if (traceStr.trim()) {
                    errorTrace += `Trace: ${traceStr.trim()}`;
                }
            }
            if (errorTrace.endsWith(' | ')) errorTrace = errorTrace.substring(0, errorTrace.length - 3);

            // ── Environment Variables ──
            let envVars: Record<string, string> = {};
            if (system?.variables?.item) {
                const items = Array.isArray(system.variables.item) ? system.variables.item : [system.variables.item];
                const targets = ['USERNAME', 'COMPUTERNAME', 'USERDOMAIN'];
                items.forEach((it: any) => {
                    const name = it['@_name'];
                    if (targets.includes(name)) {
                        envVars[name] = this.extractValue(it);
                    }
                });
            }

            return {
                allplanVersion,
                allplanBuildId,
                osVersion,
                cpu,
                gpu,
                ram,
                allplanEdition,
                allplanHotfix,
                licenseType,
                gpuDriverVersion,
                openglVersion,
                vram,
                screenResolution,
                graphicsCards,
                registryPaths,
                drives,
                printers,
                defaultPrinter,
                conflictingProcesses,
                securityServices,
                errorTrace,
                envVars,
                parsedAt: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error('Failed to parse Hotinfo XML', error);
            return null;
        }
    }

    private extractValue(node: any): string {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (node?.['#text']) return String(node['#text']);
        if (node?.['']) return String(node['']);
        return '';
    }

    private safeString(node: any): string {
        return this.extractValue(node);
    }

    private pickString(node: any, keys: string[], itemLabels: string[] = []): string {
        for (const key of keys) {
            const value = this.safeString(node?.[key]);
            if (value) return value;
        }

        const itemValue = this.pickItemString(node, itemLabels.length > 0 ? itemLabels : keys);
        if (itemValue) return itemValue;

        return '';
    }

    private pickItemString(node: any, labels: string[]): string {
        if (!node || typeof node !== 'object') return '';

        const normalizedLabels = labels.map((label) => this.normalizeHotinfoKey(label)).filter(Boolean);
        const itemContainers = [node.item, node.property, node.entry, node.value, node.info].filter(Boolean);

        for (const container of itemContainers) {
            const items = Array.isArray(container) ? container : [container];
            for (const item of items) {
                if (!item || typeof item !== 'object') continue;

                const rawName = this.pickStringDirect(item, ['@_name', 'name', '@_key', 'key', '@_id', 'id', '@_caption', 'caption']);
                const normalizedName = this.normalizeHotinfoKey(rawName);
                if (!normalizedName) continue;

                const matches = normalizedLabels.some((label) => normalizedName === label || (label.length > 3 && normalizedName.includes(label)));
                if (!matches) continue;

                const value = this.pickStringDirect(item, ['@_value', 'value', '@_text', 'text']) || this.extractValue(item);
                if (value) return value;
            }
        }

        return '';
    }

    private pickStringDirect(node: any, keys: string[]): string {
        for (const key of keys) {
            const value = this.safeString(node?.[key]);
            if (value) return value;
        }
        return '';
    }

    private normalizeHotinfoKey(value: string): string {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ı/g, 'i')
            .replace(/[^a-z0-9]+/g, '');
    }

    private formatMemory(value: any): string {
        const raw = this.safeString(value);
        if (!raw) return '';

        const normalized = raw.replace(',', '.');
        const bytes = Number(normalized);
        if (!Number.isNaN(bytes) && bytes > 0) {
            if (bytes >= 1024 * 1024 * 1024) {
                return `${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
            }
            if (bytes >= 1024 * 1024) {
                return `${Math.round(bytes / (1024 * 1024))} MB`;
            }
            return `${Math.round(bytes)} MB`;
        }

        return /\b(mb|gb|kb)\b/i.test(raw) ? raw : `${raw} MB`;
    }

    private collectGraphicsCards(video: any): GraphicsCardInfo[] {
        const rootCard = this.extractGraphicsCard(video);
        const candidates: any[] = [video];
        const adapterGroups = [
            video?.['additional-graphics-adapters']?.['graphics-adapter'],
            video?.['additional-graphics-adapters']?.adapter,
            video?.['graphics-adapters']?.['graphics-adapter'],
            video?.['graphics-adapters']?.adapter,
            video?.adapters?.adapter,
            video?.adapter,
            video?.['graphics-adapter'],
            video?.gpu,
            video?.display,
        ];

        for (const group of adapterGroups) {
            if (!group) continue;
            candidates.push(...(Array.isArray(group) ? group : [group]));
        }

        const cards = candidates
            .flatMap((candidate, index) => {
                const card = this.extractGraphicsCard(candidate);
                const cardWithSharedDisplayData = index === 0 ? card : this.applySharedGraphicsCardData(card, rootCard);
                return this.expandCombinedGraphicsCard(cardWithSharedDisplayData);
            })
            .filter((card) => card.name && card.name !== 'Unknown');

        const seen = new Set<string>();
        return cards
            .filter((card) => {
                const key = this.normalizeHotinfoKey(card.name);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 4);
    }

    private expandCombinedGraphicsCard(card: GraphicsCardInfo): GraphicsCardInfo[] {
        if (!card.name || card.name === 'Unknown') return [];

        const names = card.name
            .split(/\s+(?:\/|\+|\|)\s+|;\s*/g)
            .map((name) => name.trim())
            .filter(Boolean);

        if (names.length <= 1) return [card];

        return names.map((name, index) => ({
            ...card,
            name,
            // When Hotinfo collapses two adapters into one display string, driver
            // fields usually belong to the first adapter. Display memory/resolution
            // are often reported once for the whole video node, so keep those visible.
            driverDate: index === 0 ? card.driverDate : '',
            driverVersion: index === 0 ? card.driverVersion : '',
            openglVersion: index === 0 ? card.openglVersion : '',
        }));
    }

    private applySharedGraphicsCardData(card: GraphicsCardInfo, shared: GraphicsCardInfo): GraphicsCardInfo {
        return {
            ...card,
            vram: card.vram || shared.vram || '',
            ram: card.ram || shared.ram || '',
            resolution: card.resolution || shared.resolution || '',
            openglVersion: card.openglVersion || shared.openglVersion || '',
        };
    }

    private extractGraphicsCard(node: any): GraphicsCardInfo {
        const name =
            this.pickString(
                node,
                ['@_card-description', 'card-description', '@_chip-type', 'chip-type', '@_name', 'name', '@_description', 'description'],
                ['card description', 'graphics card', 'display adapter', 'adapter name', 'gpu', 'chip type', 'name'],
            ) || 'Unknown';

        const driverNode = node?.driver && typeof node.driver === 'object' ? node.driver : undefined;
        const dedicatedMemory = this.pickString(
            node,
            ['@_dedicated-memory', 'dedicated-memory', '@_dedicated-vram', 'dedicated-vram', '@_vram', 'vram', '@_memory-size', 'memory-size'],
            ['dedicated memory', 'dedicated vram', 'vram', 'video memory', 'memory size'],
        );
        const adapterMemory = this.pickString(
            node,
            ['@_adapter-ram', 'adapter-ram', '@_memory-size', 'memory-size', '@_ram', 'ram'],
            ['adapter ram', 'memory size', 'graphics ram', 'gpu ram', 'ram'],
        );
        const width = this.pickString(node, ['@_screen-width', 'screen-width', '@_width', 'width']);
        const height = this.pickString(node, ['@_screen-height', 'screen-height', '@_height', 'height']);

        return {
            name,
            vram: this.formatMemory(dedicatedMemory),
            ram: this.formatMemory(adapterMemory),
            resolution:
                this.pickString(node, ['@_screen-resolution', 'screen-resolution', '@_resolution', 'resolution'], ['screen resolution', 'resolution']) ||
                (width && height ? `${width}x${height}` : ''),
            driverDate:
                this.pickString(
                    node,
                    ['@_driver-date', 'driver-date', '@_driver-date-string', 'driver-date-string', '@_driverdate', 'driverdate', '@_driverDate', 'driverDate'],
                    ['driver date', 'driverdate', 'driver datum', 'treiber datum', 'sürücü tarihi', 'surucu tarihi'],
                ) ||
                this.pickString(
                    driverNode,
                    ['@_driver-date', 'driver-date', '@_driverdate', 'driverdate', '@_date', 'date', '@_driverDate', 'driverDate'],
                    ['driver date', 'driverdate', 'driver datum', 'treiber datum', 'sürücü tarihi', 'surucu tarihi'],
                ),
            driverVersion:
                this.pickString(
                    node,
                    ['@_driver-version', 'driver-version', '@_version', 'version', '@_driver', 'driver', '@_driverVersion', 'driverVersion'],
                    ['driver version', 'driverversion', 'treiber version', 'sürücü versiyonu', 'surucu versiyonu'],
                ) ||
                this.pickString(
                    driverNode,
                    ['@_driver-version', 'driver-version', '@_version', 'version', '@_driverVersion', 'driverVersion'],
                    ['driver version', 'driverversion', 'treiber version', 'sürücü versiyonu', 'surucu versiyonu'],
                ),
            openglVersion: this.pickString(node, ['@_opengl-version', 'opengl-version', '@_opengl', 'opengl'], ['opengl version', 'opengl']),
        };
    }

    private mapWindowsBuild(build: string): string | null {
        const b = parseInt(build, 10);
        if (!b || isNaN(b)) return null;

        // Windows 11
        if (b >= 26200) return '25H2';
        if (b >= 26100) return '24H2';
        if (b >= 22631) return '23H2';
        if (b >= 22621) return '22H2';
        if (b >= 22000) return '21H2';

        // Windows 10
        if (b >= 19045) return '22H2';
        if (b >= 19044) return '21H2';
        if (b >= 19043) return '21H1';
        if (b >= 19042) return '20H2';
        if (b >= 19041) return '2004';
        if (b >= 18363) return '1909';
        if (b >= 18362) return '1903';
        if (b >= 17763) return '1809';
        if (b >= 17134) return '1803';
        if (b >= 16299) return '1709';
        if (b >= 15063) return '1703';

        return null;
    }
}
