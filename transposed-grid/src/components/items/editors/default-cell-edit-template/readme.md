# default-cell-edit-template



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute        | Description | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Default     |
| ------------------------- | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `data` _(required)_       | `data`           |             | `{ [x: string]: any; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `undefined` |
| `group`                   | `group`          |             | `undefined \| { caption?: string \| undefined; collapsed: boolean; name: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                          | `undefined` |
| `originalValue`           | `original-value` |             | `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `undefined` |
| `primaryKey` _(required)_ | `primary-key`    |             | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `undefined` |
| `row` _(required)_        | `row`            |             | `{ dimensions?: RowDimensionSettings \| undefined; dataField: string; caption?: string \| undefined; group?: string \| undefined; editing?: EditingOptions \| undefined; allowSorting?: boolean \| undefined; allowHeaderFiltering?: boolean \| undefined; visible?: boolean \| undefined; orderedBy?: SortOrder \| undefined; cellTemplate?: ((props: CellTemplate) => CustomTemplateFactoryReturnType) \| undefined; editionCellTemplate?: ((props: EditCellTemplate) => CustomTemplateFactoryReturnType) \| undefined; }` | `undefined` |
| `value`                   | `value`          |             | `any`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `undefined` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `valueChange` |             | `CustomEvent<any>` |


## Methods

### `focusInput(options?: FocusOptions) => Promise<void>`



#### Parameters

| Name      | Type                        | Description |
| --------- | --------------------------- | ----------- |
| `options` | `FocusOptions \| undefined` |             |

#### Returns

Type: `Promise<void>`



### `selectAll() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [item-cell](../../item-cell)

### Graph
```mermaid
graph TD;
  item-cell --> default-cell-edit-template
  style default-cell-edit-template fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
