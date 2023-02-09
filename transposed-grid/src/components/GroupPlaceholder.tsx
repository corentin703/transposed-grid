import { FunctionalComponent, h } from '@stencil/core';
import { Group } from '../models/group';

export type GroupPlaceholderProps = {
  group: Group;
  onToggle: () => void;
  colSpan: number;
}

export const GroupPlaceholder: FunctionalComponent<GroupPlaceholderProps> = (props) => {
  return (
    <td
      class={'group mdc-data-table__header-cell'}
      onClick={(event) => {
        event.stopPropagation();
        props.onToggle();
      }}
      // colSpan={props.colSpan}
    >
      {/*&#8203; /!* Empty character for scrolling cells *!/*/}
    </td>
  );
}
