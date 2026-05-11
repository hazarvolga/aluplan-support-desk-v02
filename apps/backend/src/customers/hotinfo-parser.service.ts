import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

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
                const items = Array.isArray(cadinfo.allplanversion.item)
                    ? cadinfo.allplanversion.item
                    : [cadinfo.allplanversion.item];
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
                installedModules = modules.map((m: any) => m['@_name'] || this.extractValue(m)).filter(Boolean).slice(0, 20);
            } else if (cadinfo?.worksets?.workset) {
                const ws = Array.isArray(cadinfo.worksets.workset) ? cadinfo.worksets.workset : [cadinfo.worksets.workset];
                installedModules = ws.map((w: any) => w['@_name'] || this.extractValue(w)).filter(Boolean).slice(0, 20);
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
            if (system?.video) {
                const v = system.video;
                const primaryGPU = this.safeString(v['card-description']) || this.safeString(v['chip-type']);
                
                // Handle multiple additional adapters
                let additionalGPUs: string[] = [];
                if (v['additional-graphics-adapters']?.['graphics-adapter']) {
                    const adapters = Array.isArray(v['additional-graphics-adapters']['graphics-adapter'])
                        ? v['additional-graphics-adapters']['graphics-adapter']
                        : [v['additional-graphics-adapters']['graphics-adapter']];
                    additionalGPUs = adapters.map((a: any) => this.safeString(a['@_card-description'])).filter(Boolean);
                }

                if (additionalGPUs.length > 0 && primaryGPU) {
                    gpu = `${additionalGPUs.join(', ')} / ${primaryGPU}`;
                } else {
                    gpu = additionalGPUs[0] || primaryGPU || 'Unknown';
                }

                gpuDriverVersion = this.safeString(v['driver-version']) || this.safeString(v['@_driver-version']) || this.safeString(v['driver']) || '';
                openglVersion = this.safeString(v['opengl-version']) || this.safeString(v['@_opengl-version']) || this.safeString(v['opengl']) || '';

                // VRAM
                const dedicatedMem = v['dedicated-memory'] || v['@_dedicated-memory'] || v['adapter-ram'] || v['memory-size'];
                if (dedicatedMem) {
                    const bytes = Number(dedicatedMem);
                    if (!isNaN(bytes) && bytes > 0) {
                        if (bytes > 1024 * 1024 * 1024) {
                            vram = `${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
                        } else if (bytes > 1024 * 1024) {
                            vram = `${Math.round(bytes / (1024 * 1024))} MB`;
                        } else {
                            vram = `${dedicatedMem} MB`;
                        }
                    } else {
                        vram = this.safeString(dedicatedMem) + ' MB';
                    }
                }
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
            let drives: Array<{ root: string; total: string; free: string; fs: string }> = [];
            if (system?.drives?.drive) {
                const driveItems = Array.isArray(system.drives.drive) ? system.drives.drive : [system.drives.drive];
                drives = driveItems.map((d: any) => {
                    const total = Number(d.total || d['@_total']);
                    const free = Number(d.free || d['@_free']);
                    return {
                        root: d['@_root'] || d.root || '?',
                        total: !isNaN(total) ? `${Math.round(total / (1024 * 1024 * 1024))} GB` : '?',
                        free: !isNaN(free) ? `${Math.round(free / (1024 * 1024 * 1024))} GB` : '?',
                        fs: d.filesystem || d['@_filesystem'] || '?'
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
                screenResolution = this.safeString(system.video['@_screen-resolution']) || 
                                 this.safeString(system.video['screen-resolution']) || 
                                 this.safeString(system.video['@_resolution']) || 
                                 this.safeString(system.video['resolution']) || 
                                 (system.video['@_screen-width'] && system.video['@_screen-height'] ? `${this.extractValue(system.video['@_screen-width'])}x${this.extractValue(system.video['@_screen-height'])}` : '') ||
                                 (system.video['screen-width'] && system.video['screen-height'] ? `${system.video['screen-width']}x${system.video['screen-height']}` : '');
            }

            // ── Conflicting Processes ──
            let conflictingProcesses: string[] = [];
            if (system?.processes?.process) {
                const procs = Array.isArray(system.processes.process) ? system.processes.process : [system.processes.process];
                const knownConflicts = [
                    'onedrive.exe', 'dropbox.exe', 'googledrive.exe', 'box.exe', 'icloud.exe',
                    'ms-teams.exe', 'teams.exe', 'slack.exe', 'discord.exe', 'zoom.exe',
                    'anydesk.exe', 'teamviewer.exe',
                    'msmpeng.exe', // Windows Defender
                    'avp.exe', 'kaspersky.exe', // Kaspersky
                    'mcshield.exe', 'mcafee.exe', // McAfee
                    'avastsvc.exe', 'avastui.exe', // Avast
                    'avgnsx.exe', 'avg.exe', // AVG
                    'rtvscan.exe', 'symantec.exe', // Symantec
                    'tmproxy.exe', 'trendmicro.exe', // Trend Micro
                    'sentinelagent.exe', 'sentinelone.exe',
                    'csfalconservice.exe', 'crowdstrike.exe',
                    'ksweb.exe', 'ksafesvc.exe' // Kingsoft/Others
                ];
                conflictingProcesses = procs
                    .map((p: any) => this.extractValue(p).toLowerCase())
                    .filter((p: string) => knownConflicts.some(c => p.includes(c)))
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
                    'defender', 'antivirus', 'firewall', 'security', 'protection', 'guard', 'agent', 'sentinel', 'crowdstrike', 'mcafee', 'kaspersky', 'avast', 'avg',
                    'koruma', 'güvenlik', 'savunma', 'denetim' // Turkish keywords
                ];
                svcs.forEach((s: any) => {
                    const name = (s['@_name'] || s['name'] || '').toLowerCase();
                    const status = s['@_status'] || s['status'];
                    if (status === '4' || status === 4) { // 4 = Running
                        if (securityKeywords.some(k => name.includes(k))) {
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
                traces.forEach((t: any) => { traceStr += this.extractValue(t) + ' '; });
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
                registryPaths,
                drives,
                printers,
                defaultPrinter,
                conflictingProcesses,
                securityServices,
                errorTrace,
                envVars,
                parsedAt: new Date().toISOString()
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
