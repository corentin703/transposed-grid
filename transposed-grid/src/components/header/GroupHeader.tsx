import { FunctionalComponent, h } from '@stencil/core';
import { Group } from '../../models/group';
import { MdChevronRight } from '../../icons/md-chevron-right';
import { MdChevronDown } from '../../icons/md-chevron-down';

export type GroupHeaderType = {
  group: Group;
  onToggle: () => void;
}

export const GroupHeader: FunctionalComponent<GroupHeaderType> = (props) => {
  return (
    <div
      class={`mdc-data-table__header-cell group_header group_header_${props.group.name} group_header-sticky`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        props.onToggle();
      }}
    >
      <div class={'group_header_container'}>
        <div class={'group_header_toolbar'}>
          {
            props.group.collapsed
              ? <MdChevronRight size={'1.5rem'} color={'var(--transposed-table-group-color)'} />
              : <MdChevronDown size={'1.5rem'}  color={'var(--transposed-table-group-color)'} />
          }
        </div>
        <div class={'group_header_label'}>
          {props.group.caption ?? props.group.name}
        </div>
      </div>
    </div>
  );
}

