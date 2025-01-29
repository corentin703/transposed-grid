import { Data } from './data';
import { Row } from './row';

export type ItemClickEvent = {
  item: Data;
  itemIdx: number;
  primaryKey?: string
  primaryKeyValue?: string;
  row?: Row,
}

export type ItemDoubleClickEvent = ItemClickEvent
export type ItemHooveringEvent = ItemClickEvent
export type ItemContextMenuEvent = ItemClickEvent

export type HeaderClickEvent = {
  row?: Row;
}

export type HeaderContextMenuEvent = HeaderClickEvent
