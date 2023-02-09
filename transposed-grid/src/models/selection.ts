import { Data } from './data';

export enum SelectionMode {
  None = 'none',
  Single = 'single',
  Multiple = 'multiple',
}

export enum SelectAction {
  CheckboxOnly = 'checkboxOnly',
  Click = 'click',
  DoubleClick = 'doubleClick',
}

export type SelectionOptions = {
  allowSelectAll?: boolean;
  mode?: SelectionMode;

  selectAction?: SelectAction,
  // selectOnClick?: boolean;
}

export enum SelectionStatus {
  All = 'all',
  Some = 'some',
  None = 'none',
}

export type SelectionState = {
  selectedItems: Data[];
  mode: SelectionMode,
  areAllSelected: boolean;
  status: SelectionStatus;
}

export type SelectionEvent = SelectionState;
