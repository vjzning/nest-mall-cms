import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { SwitchStatus, TaskAccountType } from '../common/enum';
import type { ActivityTaskEntity } from './activities.task.entity';
import { Base } from './base';
import type { RankingRuleEntity } from './ranking.config.entity';
import type { RuleConfigEntity } from './rule.config.entity';
import type { TagRuleEntity } from './tag.rule.entity';
import { UserEntity } from './user.entity';

@Entity('activities')
export class ActivityEntity extends Base {
  @Column({
    type: 'varchar',
    length: 32,
    comment: '活动名称',
  })
  name?: string;
  //活动唯一标识
  @Column({
    length: 32,
    comment: '活动唯一标识',
    default: null,
    name: 'unique_code',
  })
  @Index('unique_code', {
    unique: true,
  })
  uniqueCode?: string;
  @Column({
    type: 'varchar',
    length: 128,
    comment: '活动描述',
    default: '',
  })
  description?: string;
  @Column({
    type: 'timestamp',
    comment: '活动开始时间',
  })
  start_time?: string;

  @Column({
    type: 'timestamp',
    comment: '活动结束时间',
  })
  end_time?: string;

  @ManyToOne(() => UserEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user?: Relation<UserEntity>;

  @Column({
    type: 'enum',
    enum: SwitchStatus,
    default: SwitchStatus.Yes,
    comment: 'yes 上线,no 下线',
  })
  status?: SwitchStatus;
  @Column({
    type: 'simple-json',
    name: 'rule_desc',
    default: null,
  })
  ruleDesc?: JSON;

  @Column({ type: 'enum', enum: TaskAccountType, comment: '活动账户类型' })
  account_type?: TaskAccountType;

  @Column({ type: 'varchar', comment: '活动关注用户的 email列表', default: '' })
  follow_email?: string;

  @OneToMany('ActivityTaskEntity', (task: ActivityTaskEntity) => task.activity, {
    eager: true,
    cascade: true,
  })
  tasks?: Relation<ActivityTaskEntity>[];

  @Column({ type: 'simple-json', default: null, comment: '用户自定义参数' })
  custom_param?: any;
  @Column({
    type: 'varchar',
    length: 128,
    comment: '活动单独部署APIURL',
    default: null,
  })
  apiUrl?: string;

  @Column({
    type: 'smallint',
    comment: '部署的状态, 0未部署,1部署中,2部署成功,3部署失败',
    default: 0,
    name: 'deploy_status',
  })
  deployStatus?: number;
  @Column({
    type: 'text',
    name: 'deploy_info',
    default: null,
  })
  deployInfo?: string;
  @Column({
    type: 'timestamp',
    name: 'deploy_time',
    default: null,
  })
  deployTime?: string;
  @OneToMany('RankingRuleEntity', (ranking: RankingRuleEntity) => ranking.activity, {
    cascade: true,
    eager: true,
  })
  rankingRules?: Relation<RankingRuleEntity>[];
  @ManyToMany('RuleConfigEntity', (rule: RuleConfigEntity) => rule.activity, {
    eager: true,
  })
  ruleConfig?: Relation<RuleConfigEntity>[];
  @Column({
    type: 'tinyint',
    default: 1,
    name: 'act_type',
    comment: '活动类型',
  })
  actType?: string;
  @ManyToMany('TagRuleEntity', {
    eager: true,
  })
  @JoinTable({
    name: 'activity_tag_map',
    joinColumn: {
      name: 'activity_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tagConfig?: Relation<TagRuleEntity>[];

  @BeforeInsert()
  trimCode?() {
    if (this.uniqueCode) {
      this.uniqueCode = this.uniqueCode.trim();
    }
  }
}
