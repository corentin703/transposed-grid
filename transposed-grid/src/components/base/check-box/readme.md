# check-box



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type                                                                         | Default     |
| ------------------ | -------------------- | ----------- | ---------------------------------------------------------------------------- | ----------- |
| `checkBoxTemplate` | `check-box-template` |             | `((props: CheckBoxOptions) => CustomTemplateFactoryReturnType) \| undefined` | `undefined` |
| `indeterminate`    | `indeterminate`      |             | `boolean \| undefined`                                                       | `undefined` |
| `isSelected`       | `is-selected`        |             | `boolean`                                                                    | `false`     |


## Events

| Event         | Description | Type                                    |
| ------------- | ----------- | --------------------------------------- |
| `checkChange` |             | `CustomEvent<{ isSelected: boolean; }>` |


## Dependencies

### Used by

 - [transposed-grid](../../transposed-grid)

### Graph
```mermaid
graph TD;
  transposed-grid --> check-box
  style check-box fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
