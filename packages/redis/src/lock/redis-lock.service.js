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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisLockService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const redis_client_service_1 = require("../client/redis-client.service");
let RedisLockService = class RedisLockService {
    redisClientService;
    uuid = (0, node_crypto_1.randomUUID)();
    constructor(redisClientService) {
        this.redisClientService = redisClientService;
    }
    prefix(name) {
        return `lock:${name}`;
    }
    async getClient() {
        return await this.redisClientService.getClient();
    }
    async lockOnce(name, expire) {
        const client = await this.getClient();
        const result = await client.set(this.prefix(name), this.uuid, {
            PX: expire,
            NX: true,
        });
        return result !== null;
    }
    async lock(name, expire = 60000, retryInterval = 100, maxRetryTimes = 600) {
        let retryTimes = 0;
        while (true) {
            if (await this.lockOnce(name, expire)) {
                break;
            }
            else {
                await this.sleep(retryInterval);
                if (retryTimes >= maxRetryTimes) {
                    throw new Error(`RedisLockService: locking ${name} timed out`);
                }
                retryTimes++;
            }
        }
    }
    async unlock(name) {
        const client = await this.getClient();
        const result = await client.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", {
            keys: [this.prefix(name)],
            arguments: [this.uuid],
        });
    }
    async setTTL(name, milliseconds) {
        const client = await this.getClient();
        const result = await client.pExpire(this.prefix(name), milliseconds);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, Number(ms)));
    }
};
exports.RedisLockService = RedisLockService;
exports.RedisLockService = RedisLockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_client_service_1.RedisClientService])
], RedisLockService);
//# sourceMappingURL=redis-lock.service.js.map