import { FunctionalComponent, h } from "@stencil/core";
import { ColumnResizeEvent } from "../../models/toolbar";
import { Ref } from "../../models";

export type ResizeHandlerProps = {
    onResize: (event: ColumnResizeEvent) => void;
    key: string;
    tdRef: Ref<HTMLTableCellElement | undefined>;
}

type ResizeState = {
  isResizing: boolean;
  startX: number;
  startWidth: number;
}

const resizeStates = new Map<string, ResizeState>();

export const ResizeHandler: FunctionalComponent<ResizeHandlerProps> = (props) => {
  if (!resizeStates.has(props.key)) {
    resizeStates.set(props.key, {
      isResizing: false,
      startX: 0,
      startWidth: 0,
    });
  }
  
  const state = resizeStates.get(props.key)!;
  const onMouseMoveCallback = (event: MouseEvent) => {
    if (!state.isResizing || !state.startX || !state.startWidth) {
      return;
    }

    const width = state.startWidth + event.clientX - state.startX;
    props.onResize({
      pixelWidth: width,
    });
  };

  const onMouseUpCallback = () => {
    state.isResizing = false;
    document.removeEventListener('mousemove', onMouseMoveCallback);
    document.removeEventListener('mouseup', onMouseUpCallback);
  };

  return (
    <div 
      class={'column-resizer'}
      onClick={event => {
        event.stopPropagation();
      }}
      onMouseDown={event => {
        event.stopPropagation();

        if (!props.tdRef.current) {
          return;
        }

        state.isResizing = true;

        state.startX = event.clientX;
        state.startWidth = parseInt(window.getComputedStyle(props.tdRef.current).width, 10);

        document.addEventListener('mousemove', onMouseMoveCallback);
        document.addEventListener('mouseup', onMouseUpCallback);
        resizeStates.set(props.key, state);
      }}
    />
  )
}
