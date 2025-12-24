import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
} from 'typeorm';
import { ConditionUnique, SwitchStatus, TargetType } from '../common/enum';
import { Base } from './base';


@Entity('business_target', {})
export class BusinessTargetEntity extends Base {
  @Column({
    type: 'varchar',
    comment: '指标名称',
  })
  name?: string;
  @Column({
    type: 'enum',
    enum: SwitchStatus,
    default: SwitchStatus.Yes,
    comment: '1是上线，0下线',
  })
  status?: SwitchStatus;
  @BeforeInsert()
  @BeforeUpdate()
  statusBefore() {
    if (this.status) {
      this.status = SwitchStatus.Yes;
    } else {
      this.status = SwitchStatus.No;
    }
  }
  @Column({
    type: 'varchar',
    length: 256,
    comment: '指标说明',
    default: '',
  })
  description?: string;
  // @Column({
  //   type: 'varchar',
  //   length: 256,
  //   comment: '指标脚本文件保存路径',
  //   name: 'zip_path',
  // })
  // zipPath?: string;
  // @Column({
  //   type: 'varchar',
  //   length: 256,
  //   name: 'api_url',
  //   comment: '指标脚本访问接口地址',
  // })
  // apiUrl?: string;
  // @Column({
  //   type: 'smallint',
  //   comment: '部署的状态, 0未部署,1部署中,2部署成功,3部署失败',
  //   default: 0,
  //   name: 'deploy_status',
  // })
  // deployStatus?: number;
  // @Column({
  //   type: 'text',
  //   name: 'deploy_info',
  // })
  // deployInfo?: string;
  // @Column({
  //   type: 'timestamp',
  //   name: 'deploy_time',
  //   default: null,
  // })
  // deployTime?: string;

  // @Column({
  //   type: 'varchar',
  //   length: 256,
  //   name: 'base_dir',
  //   comment: '脚本zip解压目录',
  // })
  // baseDir?: string;
  // @Column({
  //   type: 'text',
  //   name: 'function_name',
  //   comment: '脚本函数名',
  // })
  // functionName?: string;
  @Column({
    type: 'text',
    name: 'rule',
  })
  rule?: string;
  @Column({
    type: 'varchar',
    length: 20,
    default: null,
  })
  type?: TargetType;
  // [{label: '排行榜规则id', value: 'rankingRuleId'}]
  @Column({
    type: 'simple-json',
    default: null,
    name: 'params',
  })
  params: JSON;
  @Column({
    name: 'period',
    type: 'varchar',
    length: 30,
    default: null,
  })
  period: ConditionUnique;
}
