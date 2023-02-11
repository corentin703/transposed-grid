import { EditingOptions } from './edition';
import { SortOrder } from './sorting';
import { CellTemplate, EditCellTemplate } from './customTemplate';
import { CustomTemplate } from './customTemplate';

export type Row = {
  dataField: string;
  caption?: string;
  group?: string;

  editing?: EditingOptions;

  allowSorting?: boolean;
  allowHeaderFiltering?: boolean;
  visible?: boolean;
  orderedBy?: SortOrder;

  cellTemplate?: (props: CustomTemplate<CellTemplate>) => void;
  editionCellTemplate?: (props: CustomTemplate<EditCellTemplate>) => void;
}
