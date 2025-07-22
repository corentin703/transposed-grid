import { FunctionalComponent, h } from '@stencil/core';
import { Group } from '../../models/group';
import { escapeDataAttribute } from '../../utils/escapeDataAttribute';
import { ChevronRightIcon } from '../../icons/chevron-right';
import { ChevronDownIcon } from '../../icons/chevron-down';

export type GroupHeaderType = {
  group: Group;
  onToggle: () => void;
}

export const GroupHeader: FunctionalComponent<GroupHeaderType> = (props) => {
  return (
    <div
      class={`mdc-data-table__header-cell group_header group_header-sticky`}
      data-group-name={escapeDataAttribute(props.group.name)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        props.onToggle();
        console.log(event)
      }}
    >
      <div class={'group_header_container'}>
        <div class={'group_header_toolbar'}>
          {
            props.group.collapsed
              ? <ChevronRightIcon size={'1.5rem'} color={'var(--transposed-table-group-color)'} />
              : <ChevronDownIcon size={'1.5rem'}  color={'var(--transposed-table-group-color)'} />
          }
        </div>
        <div class={'group_header_label'}>
          {props.group.caption ?? props.group.name}
        </div>
      </div>
    </div>
  );
}

