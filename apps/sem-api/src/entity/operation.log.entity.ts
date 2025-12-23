import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { Base } from './base';
import { UserEntity } from './user.entity';

@Entity('operation_log', {
  synchronize: false,
})
export class OperationLogEntity extends Base {
  @Column({
    type: 'varchar',
    length: 20,
  })
  module: string;
  @Column({
    type: 'varchar',
    length: 128,
  })
  content: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
  })
  user: Relation<UserEntity>;
  @Column({
    type: 'simple-json',
    default: null,
  })
  body: JSON;
}
