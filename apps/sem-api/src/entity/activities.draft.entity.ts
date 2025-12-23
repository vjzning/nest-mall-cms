import { Column, Entity } from 'typeorm';
import { Base } from './base';

@Entity('activity_draft')
export class ActivityDraftEntity extends Base {
  @Column({
    type: 'simple-json',
    default: null,
  })
  config?: any;
}
