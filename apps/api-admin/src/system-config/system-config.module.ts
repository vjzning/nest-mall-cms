import { Module, Global } from '@nestjs/common';
import { SystemConfigModule as SharedSystemConfigModule } from '@app/shared/system-config/system-config.module';

@Global()
@Module({
  imports: [SharedSystemConfigModule],
  exports: [SharedSystemConfigModule],
})
export class SystemConfigModule { }
