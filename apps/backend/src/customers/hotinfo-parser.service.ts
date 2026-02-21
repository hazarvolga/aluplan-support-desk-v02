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
     * Parse the .hxl XML string and extract relevant system information.
     */
    parseHotinfo(xmlString: string) {
        try {
            const jsonObj = this.parser.parse(xmlString);

            // Extract safe and useful system details
            const hotinfo = jsonObj?.hotinfo;
            if (!hotinfo) {
                return null;
            }

            const cadinfo = hotinfo.cadinfo;
            const system = hotinfo.system;

            // Extract Allplan version
            let allplanVersion = 'Unknown';
            if (cadinfo?.allplanversion?.item) {
                const items = Array.isArray(cadinfo.allplanversion.item)
                    ? cadinfo.allplanversion.item
                    : [cadinfo.allplanversion.item];
                const versionItem = items.find((i: any) => i['@_name'] === 'Version');
                if (versionItem) allplanVersion = versionItem['#text'] || versionItem[''] || versionItem;
            }

            // Extract System Platform
            let osVersion = 'Unknown';
            if (system?.platform) {
                osVersion = system.platform['@_name'] || system.platform['system-caption'] || 'Unknown';
            }

            // Extract Processor
            let cpu = 'Unknown';
            if (system?.processor) {
                cpu = system.processor['@_name'] || system.processor['cpu-name'] || 'Unknown';
            }

            // Extract Video/Graphics
            let gpu = 'Unknown';
            if (system?.video) {
                const primaryGPU = system.video['card-description'] || system.video['chip-type'];
                const additionalGPU = system.video['additional-graphics-adapters']?.['graphics-adapter']?.['@_card-description'];

                if (additionalGPU && primaryGPU) {
                    gpu = `${additionalGPU} / ${primaryGPU}`;
                } else {
                    gpu = additionalGPU || primaryGPU || 'Unknown';
                }
            }

            // Extract RAM
            let ramGb = 'Unknown';
            if (system?.memory?.physical?.['@_total']) {
                const totalBytes = Number(system.memory.physical['@_total']);
                if (!isNaN(totalBytes)) {
                    ramGb = `${Math.round(totalBytes / (1024 * 1024 * 1024))} GB`;
                }
            }

            return {
                allplanVersion,
                osVersion,
                cpu,
                gpu,
                ram: ramGb,
                parsedAt: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error('Failed to parse Hotinfo XML', error);
            return null;
        }
    }
}
