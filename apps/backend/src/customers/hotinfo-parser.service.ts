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
            if (cadinfo?.allplanversion?.item) {
                const items = Array.isArray(cadinfo.allplanversion.item)
                    ? cadinfo.allplanversion.item
                    : [cadinfo.allplanversion.item];
                const versionItem = items.find((i: any) => i['@_name'] === 'Version');
                const editionItem = items.find((i: any) => i['@_name'] === 'Edition');
                const hotfixItem = items.find((i: any) => i['@_name'] === 'Hotfix' || i['@_name'] === 'Patch');
                if (versionItem) allplanVersion = this.extractValue(versionItem);
                if (editionItem) allplanEdition = this.extractValue(editionItem);
                if (hotfixItem) allplanHotfix = this.extractValue(hotfixItem);
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
                installedModules = modules.map((m: any) => m['@_name'] || this.extractValue(m)).filter(Boolean).slice(0, 10);
            } else if (cadinfo?.worksets?.workset) {
                const ws = Array.isArray(cadinfo.worksets.workset) ? cadinfo.worksets.workset : [cadinfo.worksets.workset];
                installedModules = ws.map((w: any) => w['@_name'] || this.extractValue(w)).filter(Boolean).slice(0, 10);
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
                const additionalGPU = this.safeString(v['additional-graphics-adapters']?.['graphics-adapter']?.['@_card-description']);

                if (additionalGPU && primaryGPU) {
                    gpu = `${additionalGPU} / ${primaryGPU}`;
                } else {
                    gpu = additionalGPU || primaryGPU || 'Unknown';
                }

                gpuDriverVersion = this.safeString(v['driver-version']) || this.safeString(v['@_driver-version']) || this.safeString(v['driver']) || '';
                openglVersion = this.safeString(v['opengl-version']) || this.safeString(v['@_opengl-version']) || this.safeString(v['opengl']) || '';

                // VRAM
                const dedicatedMem = v['dedicated-memory'] || v['@_dedicated-memory'] || v['adapter-ram'];
                if (dedicatedMem) {
                    const bytes = Number(dedicatedMem);
                    if (!isNaN(bytes) && bytes > 0) {
                        vram = bytes > 1024 * 1024 ? `${Math.round(bytes / (1024 * 1024))} MB` : `${dedicatedMem}`;
                    } else {
                        vram = this.safeString(dedicatedMem);
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

            // ── Display / Screen Resolution ──
            let screenResolution = '';
            if (system?.display) {
                const d = system.display;
                screenResolution = d['@_resolution'] || d['resolution'] || '';
                if (!screenResolution && d['@_width'] && d['@_height']) {
                    screenResolution = `${d['@_width']}x${d['@_height']}`;
                }
            } else if (system?.video?.['screen-width'] && system?.video?.['screen-height']) {
                screenResolution = `${system.video['screen-width']}x${system.video['screen-height']}`;
            }

            // ── Disk / Storage ──
            let diskInfo = '';
            if (system?.disk) {
                const d = system.disk;
                const totalGB = d['@_total'] ? Math.round(Number(d['@_total']) / (1024 * 1024 * 1024)) : null;
                const freeGB = d['@_free'] ? Math.round(Number(d['@_free']) / (1024 * 1024 * 1024)) : null;
                const dtype = d['@_type'] || '';
                if (totalGB && freeGB) {
                    diskInfo = `${totalGB} GB toplam, ${freeGB} GB boş${dtype ? ` (${dtype})` : ''}`;
                } else if (d['@_name'] || d['#text']) {
                    diskInfo = d['@_name'] || String(d['#text']);
                }
            } else if (system?.storage) {
                diskInfo = system.storage['@_name'] || this.extractValue(system.storage) || '';
            }

            // ── .NET Framework ──
            let dotnetVersion = '';
            if (system?.dotnet) {
                dotnetVersion = system.dotnet['@_version'] || system.dotnet['@_name'] || this.extractValue(system.dotnet) || '';
            } else if (system?.framework) {
                dotnetVersion = system.framework['@_version'] || this.extractValue(system.framework) || '';
            }

            // ── Network ──
            let networkInfo = '';
            if (system?.network) {
                const n = system.network;
                networkInfo = n['@_name'] || n['adapter-name'] || this.extractValue(n) || '';
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

            // ── Conflicting Processes ──
            let conflictingProcesses: string[] = [];
            if (system?.processes?.process) {
                const procs = Array.isArray(system.processes.process) ? system.processes.process : [system.processes.process];
                const knownConflicts = ['onedrive.exe', 'dropbox.exe', 'googledrive.exe', 'msmpeng.exe', 'teams.exe'];
                conflictingProcesses = procs
                    .map((p: any) => this.extractValue(p).toLowerCase())
                    .filter((p: string) => knownConflicts.some(c => p.includes(c)))
                    .map((p: string) => {
                        const parts = p.split('\\');
                        return parts[parts.length - 1]; // get just the executable name
                    });
                conflictingProcesses = [...new Set(conflictingProcesses)]; // Remove duplicates
            }

            return {
                // Core (always available)
                allplanVersion,
                osVersion,
                cpu,
                gpu,
                ram,
                // Extended
                allplanEdition,
                allplanHotfix,
                licenseType,
                gpuDriverVersion,
                openglVersion,
                vram,
                screenResolution,
                dotnetVersion,
                networkInfo,
                diskInfo,
                installedModules,
                errorTrace,
                conflictingProcesses,
                parsedAt: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error('Failed to parse Hotinfo XML', error);
            return null;
        }
    }

    /** Safely extract text value from an XML node */
    /** Safely extract text value from an XML node */
    private extractValue(node: any): string {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (node?.['#text']) return String(node['#text']);
        if (node?.['']) return String(node['']);
        return '';
    }

    /** Safely extract string from possibly object node */
    private safeString(node: any): string {
        return this.extractValue(node);
    }

    /** Helper to map raw OS build numbers to human readable feature updates */
    private mapWindowsBuild(build: string): string | null {
        const b = parseInt(build, 10);
        if (!b || isNaN(b)) return null;

        // Windows 11
        if (b >= 26100) return '24H2';
        if (b >= 22631) return '23H2';
        if (b >= 22621) return '22H2';
        if (b >= 22000) return '21H2';

        // Windows 10
        if (b >= 19045) return '22H2';
        if (b >= 19044) return '21H2';

        return null;
    }
}
