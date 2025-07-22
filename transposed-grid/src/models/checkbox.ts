import { CustomTemplate, CustomTemplateFactoryReturnType } from "./customTemplate";

export type CheckBoxOptions = {
  indeterminate?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (isSelected: boolean) => void;
}

export type CheckBoxTemplate = (props: CustomTemplate<CheckBoxOptions>) => CustomTemplateFactoryReturnType;