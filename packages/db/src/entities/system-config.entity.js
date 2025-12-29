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
exports.SystemConfigEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
let SystemConfigEntity = class SystemConfigEntity extends base_entity_1.BaseEntity {
    key;
    value;
    group;
    isEncrypted;
    description;
};
exports.SystemConfigEntity = SystemConfigEntity;
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], SystemConfigEntity.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SystemConfigEntity.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'system' }),
    __metadata("design:type", String)
], SystemConfigEntity.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_encrypted', default: false }),
    __metadata("design:type", Boolean)
], SystemConfigEntity.prototype, "isEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], SystemConfigEntity.prototype, "description", void 0);
exports.SystemConfigEntity = SystemConfigEntity = __decorate([
    (0, typeorm_1.Entity)('sys_config')
], SystemConfigEntity);
//# sourceMappingURL=system-config.entity.js.map