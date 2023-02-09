import { FunctionalComponent, h } from '@stencil/core';

export type GridToolbarButtonProps = {
  caption?: string;
  onClick: () => void;
}

export const GridToolbarButton: FunctionalComponent<GridToolbarButtonProps> = (props) => {
  return (
    <button
      class={'mdc-button mdc-button--raised toolbar__btn'}
      onClick={() => props.onClick()}
    >
      <span class={'mdc-button__ripple'} />
      <span class={'mdc-button__focus-ring'} />
      <span class={'mdc-button__label'}>
        {props.caption}
      </span>
    </button>
  );
}

