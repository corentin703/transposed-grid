import { FunctionalComponent, h } from '@stencil/core';
import { SortOrder } from '../../models/sorting';
import { MdSortDescending } from '../../icons/md-sort-descending';
import { MdSortAscending } from '../../icons/md-sort-ascending';
import { Row } from '../../models/row';
import { Group } from '../../models/group';

export type ItemHeaderProps = {
  isSticky?: boolean;

  row: Row;
  group?: Group;
  onClick: () => void;
  onContextMenu: (event: MouseEvent) => void;
}

export const ItemHeader: FunctionalComponent<ItemHeaderProps> = (props) => {
  const getOrderByIndicator = () => {
    if (props.row.orderedBy === undefined) {
      return <span />
    }

    if (props.row.orderedBy === SortOrder.Desc) {
      return <MdSortDescending size={'1.5rem'} />
    }

    return <MdSortAscending size={'1.5rem'} />
  };

  const classNames = [
    'mdc-data-table__header-cell',
    'cell_header',
    `cell_header_${props.row.dataField}`,
    props.group
      ? 'cell_header-grouped'
      : 'cell_header-no-grouped',
  ];

  if (props.isSticky) {
    classNames.push('cell_header-sticky');
  }

  if (props.group?.collapsed) {
    classNames.push('cell-hidden');
  }

  const caption = props.row.caption ?? props.row.dataField;

  return (
    <th
      class={classNames.join(' ')}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        props.onClick();
      }}
      onDblClick={event => {
        event.preventDefault();
      }}
      onContextMenu={event => {
        props.onContextMenu(event);
      }}
    >
      <div class={'cell_header_content'}>
        <div class={'cell_header_label'}>
          {caption}
        </div>
        <div class={'cell_header_toolbar'}>
          {getOrderByIndicator()}
        </div>
      </div>
    </th>
  );
}

