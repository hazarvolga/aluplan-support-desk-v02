import { Controller, Get, Param } from '@nestjs/common';
@Controller('test')
export class TestController {
  @Get('assets/:key(*)')
  getAsset(@Param('key') key: string) {
    return key;
  }
}
