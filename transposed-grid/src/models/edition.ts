import { Data } from './data';

export enum EditActionType {
  Insert = 'insert',
  Update = 'update',
  Delete = 'delete',
}

export enum EditEventType {
  Inserting = 'inserting',
  Updating = 'updating',
  Deleting = 'deleting',
}

export type RowEditingOptions = {
  // allowAdding?: boolean;
  // allowDeleting?: boolean;
  allowUpdating?: boolean;
};

export enum StartEditAction {
  Click = 'click',
  DoubleClick = 'doubleClick',
}

export type EditingOptions =
  & RowEditingOptions
  & {
      confirmDelete?: boolean;
      startEditAction?: StartEditAction;
      optionRowName?: string;
      texts?: {
        // addRow?: string,
        cancel?: string,
        // deleteRow?: string,
        editRow?: string,
        save?: string,
        // undelete?: string,
      }
    }
;

export type EditEvent = {
  original: Data | null;
  item: Data;
  itemIdx: number;
  primaryKey?: string
  primaryKeyValue?: string;
  eventType: EditEventType;
};

export type EditionResult = {
  // inserted: EditEvent[],
  updated: EditEvent[],
  // deleted: EditEvent[],
}

export type EditionResultEvent =
  & EditionResult
  & {
      data: Data[];
      original: Data[];
      cancelEdit: boolean;
    }
