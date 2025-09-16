import { EditingOptions } from './edition';
import { SortOrder } from './sorting';
import { CellTemplate, CustomTemplateFactoryReturnType, EditCellTemplate } from './customTemplate';
import { CustomTemplate } from './customTemplate';

export type ColumnDimensionSettings = {
  allowResize?: boolean;
  minPixelWidth?: number;
  maxPixelWidth?: number;
  initialPixelWidth?: number;
}

export type RowDimensionSettings = {
  minPixelHeight?: number;
  maxPixelHeight?: number;
  pixelHeight?: number;
}

export type DimensionSettings = ColumnDimensionSettings & RowDimensionSettings

export type Row = {
  dimensions?: RowDimensionSettings;
  
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
