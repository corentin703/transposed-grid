import { Row } from './row';

export type Group = {
  caption?: string;
  collapsed: boolean;
  name: string;
}

export type GroupState = Group & {
  isFixed: boolean;
}

export type GroupToggledEvent = {
  group: Group;
  rows: Row[];
  collapsed: boolean;
}
