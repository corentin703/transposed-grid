import { FunctionalComponent, h } from '@stencil/core';
import { IconProps } from './types';

export const MdChevronDown: FunctionalComponent<IconProps> = (props) => {
  return (
    <div
      style={{
        height: props.size,
        width: props.size,
      }}
    >
      <svg xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 24 24'}>
        <title>chevron-down</title>
        <path d={'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z'} />
      </svg>
    </div>
  )
}