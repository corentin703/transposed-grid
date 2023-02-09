import { Data } from './data';

export type ClickEvent = {
  item: Data;
  itemIdx: number;
  primaryKey?: string
  primaryKeyValue?: string;
}
