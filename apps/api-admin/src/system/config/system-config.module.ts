import { Module, Global } from '@nestjs/common';
import { SystemConfigModule as SharedSystemConfigModule } from '@app/shared/system-config/system-config.module';
import { SystemConfigController } from './system-config.controller';

@Global()
@Module({
  imports: [SharedSystemConfigModule],
  controllers: [SystemConfigController],
  exports: [SharedSystemConfigModule],
})
export class SystemConfigModule { }
