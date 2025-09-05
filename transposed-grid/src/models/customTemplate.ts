import { Data } from './data';
import { Group } from './group';
import { Row } from './row';
import { EventEmitter } from '@stencil/core';

export type CustomTemplateFactoryReturnType = (HTMLElement | undefined | { element: HTMLElement, destructor?: () => void, focus?: () => void, });

export type CustomTemplate<TContext> =
  & TContext
export interface CellTemplate {
  data: Data;
  group?: Group;
  row: Row;
  primaryKey: string;
  originalValue: any;
  value: any;
}

export interface EditCellTemplateMethods {
  focusInput: (options?: FocusOptions) => Promise<void>;
  selectAll: () => Promise<void>;
}

export interface InternalEditCellTemplate extends CellTemplate {
  valueChange: EventEmitter<any>;
}

export interface EditCellTemplate extends CellTemplate {
  onValueChange: (updatedValue: any) => void;
}

export type Ref<T> = {
  current: T;
}

