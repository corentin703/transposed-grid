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
    <th
      class={`mdc-data-table__header-cell group__header`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        props.onToggle();
      }}
    >
      <div class={'group__header_container'}>
        <div class={'group__header_toolbar'}>
          {
            props.group.collapsed
              ? <MdChevronRight size={'1.5rem'} />
              : <MdChevronDown size={'1.5rem'} />
          }
        </div>
        <div class={'group__header_label'}>
          {props.group.caption ?? props.group.name}
        </div>
      </div>
    </th>
  );
}

