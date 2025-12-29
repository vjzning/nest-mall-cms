"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisLockModule = void 0;
const common_1 = require("@nestjs/common");
const redis_lock_service_1 = require("./redis-lock.service");
const redis_client_module_1 = require("../client/redis-client.module");
let RedisLockModule = class RedisLockModule {
};
exports.RedisLockModule = RedisLockModule;
exports.RedisLockModule = RedisLockModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_client_module_1.RedisClientModule],
        providers: [redis_lock_service_1.RedisLockService],
        exports: [redis_lock_service_1.RedisLockService],
    })
], RedisLockModule);
//# sourceMappingURL=redis-lock.module.js.map