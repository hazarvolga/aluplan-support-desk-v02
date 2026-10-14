import { Module } from '@nestjs/common';
import { OutboundUrlSafetyService } from '../../knowledge-pool/outbound-url-safety.service';
import { OutboundHttpService } from './outbound-http.service';

@Module({
    providers: [OutboundHttpService, OutboundUrlSafetyService],
    exports: [OutboundHttpService, OutboundUrlSafetyService],
})
export class OutboundHttpModule {}
