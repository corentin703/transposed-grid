import { FunctionalComponent, h } from '@stencil/core';

export type MdCheckboxProps = {
  indeterminate?: boolean;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
}

export const MdCheckbox: FunctionalComponent<MdCheckboxProps> = (props) => {
  return (
    <div
      class={'mdc-checkbox mdc-checkbox--touch'}
    >
      <input
        type={'checkbox'}
        class={'mdc-checkbox__native-control'}
        checked={props.isSelected}
        indeterminate={props.indeterminate}
        onChange={event => {
          const checkBox = event.currentTarget as HTMLInputElement;
          props.onChange(checkBox.checked)
        }}
      />
      <div class={'mdc-checkbox__background'}>
        <svg
          class={'mdc-checkbox__checkmark'}
         viewBox={'0 0 24 24'}
        >
          <path
            class={'mdc-checkbox__checkmark-path'}
            fill={'none'}
            d={'M1.73,12.91 8.1,19.28 22.79,4.59'}
          />
        </svg>
        <div class={'mdc-checkbox__mixedmark'} />
      </div>
      <div class={'mdc-checkbox__ripple'} />
      <div class={'mdc-checkbox__focus-ring'} />
    </div>
  )
}
