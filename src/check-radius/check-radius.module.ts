import { Module } from '@nestjs/common';

import { CheckRadiusService } from './check-radius.service';

@Module({
  providers: [CheckRadiusService],
})
export class CheckRadiusModule {}
