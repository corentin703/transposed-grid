import { FunctionalComponent, h } from '@stencil/core';
import { IconProps } from './types';

export const MdChevronRight: FunctionalComponent<IconProps> = (props) => {
  return (
    <div
      style={{
        height: props.size,
        width: props.size,
      }}
    >
      <svg xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 24 24'}>
        <title>chevron-right</title>
        <path d={'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'} />
      </svg>
    </div>
  )
}