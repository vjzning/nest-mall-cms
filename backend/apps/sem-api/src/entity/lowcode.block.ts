import { Column, Entity } from 'typeorm';
import { Base } from './base';
@Entity('lowcode_block')
export class LowcodeBlockEntity extends Base {
  @Column()
  name: string;
  @Column()
  title: string;
  @Column({
    name: 'schema',
    type: 'simple-json',
    default: null,
  })
  schema: JSON;
  @Column({
    type: 'text',
  })
  screenshot: string;
}
