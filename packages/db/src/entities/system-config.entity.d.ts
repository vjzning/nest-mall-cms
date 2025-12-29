import { BaseEntity } from './base.entity';
export declare class SystemConfigEntity extends BaseEntity {
    key: string;
    value: string;
    group: string;
    isEncrypted: boolean;
    description: string;
}
