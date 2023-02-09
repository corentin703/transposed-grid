import { Data } from './data';
import { Group } from './group';
import { Row } from './row';
import { EventEmitter } from '@stencil/core';

export type CustomTemplate<TContext> =
  & TContext
  & {
      element: HTMLElement;
      renderDefault: () => void;
    }

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

export interface EditCellTemplate extends CellTemplate {
  valueChange: EventEmitter<any>;
}

export interface CustomEditCellTemplate extends CellTemplate {
  onValueChange: (updatedValue: any) => void;
}

