import { FunctionalComponent, h } from '@stencil/core';
import { IconProps } from './types';

export const ChevronRightIcon: FunctionalComponent<IconProps> = (props) => {
  return (
    <div
      style={{
        height: props.size,
        width: props.size,
        fill: props.color,
      }}
    >
      <slot name="icon-chevron-right">
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </slot>
    </div>
  )
}
