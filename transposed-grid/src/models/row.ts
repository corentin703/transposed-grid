import { EditingOptions } from './edition';
import { SortOrder } from './sorting';
import { CellTemplate, CustomTemplateFactoryReturnType, EditCellTemplate } from './customTemplate';
import { CustomTemplate } from './customTemplate';


export type Row = {
  fixedHeight?: string;
  fixedEditingHeight?: string;
  maxPixelHeight?: number;
  
  dataField: string;
  caption?: string;
  group?: string;

  editing?: EditingOptions;

  allowSorting?: boolean;
  allowHeaderFiltering?: boolean;
  visible?: boolean;
  orderedBy?: SortOrder;

  cellTemplate?: (props: CustomTemplate<CellTemplate>) => CustomTemplateFactoryReturnType;
  editionCellTemplate?: (props: CustomTemplate<EditCellTemplate>) => CustomTemplateFactoryReturnType;
}
