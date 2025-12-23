import { Column, Entity } from 'typeorm';
import { TaskAccountType, TaskCycle, TaskScheduleMode, TaskStatus } from '../common/enum';
import { Base } from './base';
import { CategoryTaskEntity } from './category.task.entity';

@Entity('task_info')
export class TaskEntity extends Base {
  @Column({
    type: 'varchar',
    length: 32,
    comment: '任务名称',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.Online,
    comment: '1 上线,0 下线',
  })
  status: TaskStatus;

  @Column({ type: 'simple-json', default: null, comment: '分类名称' })
  category: CategoryTaskEntity[];

  @Column({ type: 'enum', enum: TaskCycle, comment: '任务周期' })
  cycle: TaskCycle;
  @Column({
    name: 'cron_exp',
    default: null,
  })
  cronExp: string;
  @Column({ type: 'enum', enum: TaskAccountType, comment: '账户类型' })
  account_type: TaskAccountType;

  @Column({
    type: 'varchar',
    length: 1024,
    comment: '任务跳转参数',
    default: null,
  })
  href_param: string;
  @Column({ type: 'simple-json', default: null, comment: '用户自定义参数' })
  custom_param: any;
  @Column({
    type: 'enum',
    enum: TaskScheduleMode,
    default: TaskScheduleMode.Active,
    comment: '任务调度方式 主动或被动',
    name: 'schedule_mode',
  })
  scheduleMode: TaskScheduleMode;
}
