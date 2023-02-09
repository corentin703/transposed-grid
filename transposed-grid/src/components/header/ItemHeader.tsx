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
  onSort: () => void;
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
    'cell__header',
    props.group
      ? 'cell__header-grouped'
      : 'cell__header-no-grouped',
  ];

  if (props.isSticky) {
    classNames.push('cell__header-sticky');
  }

  if (props.group?.collapsed) {
    classNames.push('cell-hidden');
  }

  const caption = props.row.caption ?? props.row.dataField;
  const minWidth = caption.length * 0.6 + 2;

  return (
    <th
      class={classNames.join(' ')}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        props.onSort();
      }}
      onDblClick={event => {
        event.preventDefault();
      }}
      style={{
        minWidth: `${minWidth}em`
      }}
    >
      <div class={'cell__header_content'}>
        <div class={'cell__header_label'}>
          {caption}
        </div>
        <div class={'cell__header_toolbar'}>
          {getOrderByIndicator()}
        </div>
      </div>
    </th>
  );
}

