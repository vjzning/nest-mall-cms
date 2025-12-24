import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { ActivityEntity } from './activities.entity';
import { Base } from './base';

@Entity('user_resource', {
  synchronize: false,
})
export class UserResouceEntity extends Base {
  @Column({
    name: 'bus_user_id',
  })
  busUserId: string;
  @Column()
  amount: number;
  @ManyToOne(() => ActivityEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'activity_id',
  })
  activity?: Relation<ActivityEntity>;
  @Column({
    name: 'type',
  })
  type: string;
  @Column({
    name: 'last_time',
  })
  lastTime: number;
}
