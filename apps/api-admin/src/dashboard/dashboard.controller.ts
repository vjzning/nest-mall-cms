import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DashboardService } from './dashboard.service';
import { RequirePermissions } from '../common/decorators/auth.decorator';

@Controller('dashboard')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60 * 1000) // 缓存 60 秒 (单位: 毫秒，取决于 cache-manager 版本，Nest 11/Cache Manager 5+ 通常是毫秒)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('overview')
    @RequirePermissions('dashboard:view')
    async getOverview() {
        return this.dashboardService.getOverview();
    }

    @Get('statistics')
    @RequirePermissions('dashboard:view')
    async getStatistics() {
        return this.dashboardService.getStatistics();
    }

    @Get('alerts')
    @RequirePermissions('dashboard:view')
    async getAlerts() {
        return this.dashboardService.getAlerts();
    }
}
