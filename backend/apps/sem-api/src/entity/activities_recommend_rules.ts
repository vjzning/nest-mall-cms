import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ActivityEntity } from './activities.entity';
import { Base } from './base';
@Entity('activities_recommend_rules')
export class RecommendRules extends Base {
  @OneToOne(() => ActivityEntity)
  @JoinColumn({ name: 'activity_id' })
  activity: ActivityEntity;

  @Column({
    type: 'simple-json',
    comment: '任务推荐规则',
  })
  task_rules;

  @Column({
    type: 'simple-json',
    comment: '奖励推荐规则',
  })
  award_rules;
}
