# transposed-grid



<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                       | Description | Type                                                                                                                                                                                                                                                                                  | Default     |
| --------------------------- | ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `allowHeaderFiltering`      | `allow-header-filtering`        |             | `boolean \| undefined`                                                                                                                                                                                                                                                                | `undefined` |
| `allowSorting`              | `allow-sorting`                 |             | `boolean \| undefined`                                                                                                                                                                                                                                                                | `undefined` |
| `editing`                   | --                              |             | `RecordLevelOptions & { confirmDelete?: boolean \| undefined; startEditAction?: StartEditAction \| undefined; optionRowName?: string \| undefined; texts?: { cancel?: string \| undefined; editRow?: string \| undefined; save?: string \| undefined; } \| undefined; } \| undefined` | `undefined` |
| `fixedColumnWidth`          | `fixed-column-width`            |             | `string \| undefined`                                                                                                                                                                                                                                                                 | `undefined` |
| `focusedRowPrimaryKeyValue` | `focused-row-primary-key-value` |             | `string \| undefined`                                                                                                                                                                                                                                                                 | `undefined` |
| `groupSectionHeight`        | `group-section-height`          |             | `string \| undefined`                                                                                                                                                                                                                                                                 | `undefined` |
| `groups`                    | --                              |             | `Group[] \| undefined`                                                                                                                                                                                                                                                                | `undefined` |
| `items`                     | --                              |             | `Data[]`                                                                                                                                                                                                                                                                              | `[]`        |
| `maxPixelColumnWidth`       | `max-pixel-column-width`        |             | `number \| undefined`                                                                                                                                                                                                                                                                 | `undefined` |
| `primaryKey`                | `primary-key`                   |             | `string \| undefined`                                                                                                                                                                                                                                                                 | `undefined` |
| `rows`                      | --                              |             | `Row[] \| undefined`                                                                                                                                                                                                                                                                  | `undefined` |
| `selection`                 | --                              |             | `undefined \| { allowSelectAll?: boolean \| undefined; mode?: SelectionMode \| undefined; selectAction?: SelectAction \| undefined; }`                                                                                                                                                | `undefined` |
| `striped`                   | `striped`                       |             | `boolean`                                                                                                                                                                                                                                                                             | `true`      |
| `tableClass`                | `table-class`                   |             | `string \| undefined`                                                                                                                                                                                                                                                                 | `undefined` |
| `toolbar`                   | --                              |             | `undefined \| { left?: ToolbarButtonOptions[] \| undefined; center?: ToolbarButtonOptions[] \| undefined; right?: ToolbarButtonOptions[] \| undefined; }`                                                                                                                             | `undefined` |
| `toolbarTemplate`           | --                              |             | `((props: CustomTemplate<ToolbarOptions>) => void) \| undefined`                                                                                                                                                                                                                      | `undefined` |


## Events

| Event                 | Description | Type                                                                                                                                             |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cancel`              |             | `CustomEvent<EditionResult & { data: Data[]; original: Data[]; cancelEdit: boolean; }>`                                                          |
| `editionValidation`   |             | `CustomEvent<EditionResult & { data: Data[]; original: Data[]; cancelEdit: boolean; }>`                                                          |
| `groupCollapsed`      |             | `CustomEvent<{ group: Group; rows: Row[]; collapsed: boolean; }>`                                                                                |
| `headerClick`         |             | `CustomEvent<{ row?: Row \| undefined; }>`                                                                                                       |
| `headerContextMenu`   |             | `CustomEvent<{ row?: Row \| undefined; }>`                                                                                                       |
| `itemClick`           |             | `CustomEvent<{ item: Data; itemIdx: number; primaryKey?: string \| undefined; primaryKeyValue?: string \| undefined; row?: Row \| undefined; }>` |
| `itemContextMenu`     |             | `CustomEvent<{ item: Data; itemIdx: number; primaryKey?: string \| undefined; primaryKeyValue?: string \| undefined; row?: Row \| undefined; }>` |
| `itemDoubleClick`     |             | `CustomEvent<{ item: Data; itemIdx: number; primaryKey?: string \| undefined; primaryKeyValue?: string \| undefined; row?: Row \| undefined; }>` |
| `itemHoovering`       |             | `CustomEvent<{ item: Data; itemIdx: number; primaryKey?: string \| undefined; primaryKeyValue?: string \| undefined; row?: Row \| undefined; }>` |
| `itemSelectionChange` |             | `CustomEvent<{ selectedItems: Data[]; mode: SelectionMode; areAllSelected: boolean; status: SelectionStatus; }>`                                 |
| `save`                |             | `CustomEvent<EditionResult & { data: Data[]; original: Data[]; cancelEdit: boolean; }>`                                                          |


## Dependencies

### Depends on

- [grid-toolbar](../toolbar/grid-toolbar)
- [item-cell](../items/item-cell)

### Graph
```mermaid
graph TD;
  transposed-grid --> grid-toolbar
  transposed-grid --> item-cell
  item-cell --> default-cell-template
  item-cell --> default-cell-edit-template
  style transposed-grid fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
