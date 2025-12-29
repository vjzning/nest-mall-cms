"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClientService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
let RedisClientService = class RedisClientService {
    cacheManager;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async getClient() {
        const stores = this.cacheManager?.stores;
        let keyv;
        if (Array.isArray(stores)) {
            keyv = stores[0];
        }
        else {
            keyv = this.cacheManager?.store;
        }
        if (!keyv) {
            keyv = this.cacheManager;
        }
        if (!keyv) {
            throw new Error('RedisClientService: cache store does not support getClient(). Ensure CacheModule is configured with KeyvRedis.');
        }
        const redisStore = keyv.store;
        if (!redisStore || typeof redisStore.getClient !== 'function') {
            if (typeof keyv.getClient === 'function') {
                return await keyv.getClient();
            }
            throw new Error('RedisClientService: Could not find getClient() method on cache store.');
        }
        return await redisStore.getClient();
    }
};
exports.RedisClientService = RedisClientService;
exports.RedisClientService = RedisClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], RedisClientService);
//# sourceMappingURL=redis-client.service.js.map