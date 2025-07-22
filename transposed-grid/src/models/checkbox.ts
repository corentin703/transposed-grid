import { CustomTemplate, CustomTemplateFactoryReturnType } from "./customTemplate";

export type CheckBoxOptions = {
  indeterminate?: boolean;
  isSelected?: boolean;
  onCheckChange?: (isSelected: boolean) => void;
}

export type CheckBoxTemplate = (props: CustomTemplate<CheckBoxOptions>) => CustomTemplateFactoryReturnType;