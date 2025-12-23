import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  RelationId,
  type Relation,
} from 'typeorm';
import { ActivityEntity } from './activities.entity';
import { Base } from './base';
import { nanoid } from 'nanoid';

@Entity('lowcode_pages', {
  synchronize: false,
})
export class LowcodePageEntity extends Base {
  @Column()
  @Index('uuid', {
    unique: true,
  })
  uuid: string;
  @Column()
  title: string;
  @Column({
    name: 'schema',
    type: 'simple-json',
    default: null,
  })
  schema: JSON;
  @Column({
    name: 'prod_schema_url',
    type: 'simple-json',
    default: null,
  })
  prodSchemaUrl: string;
  @ManyToOne(() => ActivityEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'activity_id',
  })
  activity?: Relation<ActivityEntity>;
  @RelationId((task: LowcodePageEntity) => task.activity)
  activityId: number;
  @Column({
    default: 0,
    name: 'is_home',
  })
  isHome: number;
  @Column('timestamp', {
    default: null,
    comment: '发布时间',
    name: 'publish_time',
  })
  publishTime?: string;
  @BeforeInsert()
  buildUUID() {
    this.uuid = nanoid(10);
  }
}
