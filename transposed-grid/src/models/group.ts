import { Row } from './row';

export type Group = {
  caption?: string;
  collapsed: boolean;
  name: string;
}

export type GroupCollapsedEvent = {
  group: Group;
  rows: Row[];
  collapsed: boolean;
}
