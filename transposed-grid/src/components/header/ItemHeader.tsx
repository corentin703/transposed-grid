import { FunctionalComponent, h } from '@stencil/core';
import { SortOrder } from '../../models/sorting';
import { MdSortDescending } from '../../icons/sort-descending';
import { MdSortAscendingIcon } from '../../icons/sort-ascending';
import { Row } from '../../models/row';
import { Group } from '../../models/group';
import { escapeDataAttribute } from '../../utils/escapeDataAttribute';
import { ResizeHandler } from '../items/ResizeHandler';
import { ColumnResizeEvent, Ref } from '../../models';

export type ItemHeaderProps = {
  isSticky?: boolean;

  isEditing: boolean;
  row: Row;
  group?: Group;
  onClick: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onResize?: (event: ColumnResizeEvent) => void;
}

export const ItemHeader: FunctionalComponent<ItemHeaderProps> = (props) => {
  const getOrderByIndicator = () => {
    if (props.row.orderedBy === undefined) {
      return <span />
    }

    if (props.row.orderedBy === SortOrder.Desc) {
      return <MdSortDescending size={'1.5rem'} />
    }

    return <MdSortAscendingIcon size={'1.5rem'} />
  };

  const classNames = [
    'cell_header',
    props.group
      ? 'cell_header-grouped'
      : 'cell_header-no-grouped',
  ];

  if (props.isSticky) {
    classNames.push('cell_header-sticky');
  }

  if (props.isEditing) {
    classNames.push(`cell_header_editing_${props.row.dataField}`);
  } 

  if (props.group?.collapsed) {
    classNames.push('cell-hidden');
  }

  const caption = props.row.caption ?? props.row.dataField;

  const tdRef: Ref<HTMLTableCellElement | undefined> = {
    current: undefined,
  };

  const minHeight = props.row.dimensions?.minPixelHeight ? `${props.row.dimensions?.minPixelHeight}px` : undefined;
  const maxHeight = props.row.dimensions?.maxPixelHeight ? `${props.row.dimensions?.maxPixelHeight}px` : undefined;

  return (
    <th
      class={classNames.join(' ')}
      ref={ref => tdRef.current = ref}
      data-data-field={escapeDataAttribute(props.row.dataField)}
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
      <div class={'cell_header_content'} style={{ minHeight: minHeight, maxHeight: maxHeight, }}>
        <div class={'cell_header_label'}>
          {caption}
        </div>
        <div class={'cell_header_toolbar'}>
          {getOrderByIndicator()}
        </div>
      </div>
      {props.onResize && 
        <ResizeHandler
          key={'header'}
          tdRef={tdRef}
          onResize={props.onResize}
        />
      }
    </th>
  );
}

