import { FunctionalComponent, h } from '@stencil/core';
import { IconProps } from './types';

export const ChevronDownIcon: FunctionalComponent<IconProps> = (props) => {
  return (
    <div
      style={{
        height: props.size,
        width: props.size,
        fill: props.color,
      }}
    >
      <slot name="icon-chevron-down">
        <svg 
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </slot>
    </div>
  )
}
