import { FunctionalComponent, h } from '@stencil/core';

export type GridToolbarButtonProps = {
  caption?: string;
  onClick: () => void;
}

export const GridToolbarButton: FunctionalComponent<GridToolbarButtonProps> = (props) => {
  return (
    <button
      onClick={() => props.onClick()}
    >
      {props.caption}
    </button>
  );
}

