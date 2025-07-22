import { FunctionalComponent, h } from '@stencil/core';
import { Data } from '../../models/data';
import { Group } from '../../models/group';
import { Row } from '../../models/row';
import { escapeDataAttribute } from '../../utils/escapeDataAttribute';

export type ItemCellWrapperProps = {
  key: string | number;

  item: Data;
  primaryKey: string;
  value: any;
  originalValue?: any;

  isActive: boolean;
  isEditing: boolean;
  isSelected: boolean;
  isStriped: boolean;

  isSticky?: boolean;

  rowIndex: number;
  group?: Group;
  row: Row;

  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onEnterKeyDown: () => void;
  onEscapeKeyDown: () => void;
  onTabKeyDown: () => void;
  onMouseEnter: () => void;
  onValueChange: (updatedValue: any) => void;
}

export const ItemCellWrapper: FunctionalComponent<ItemCellWrapperProps> = (props) => {

  if (!props.row.visible) {
    return (
      <td></td>
    )
  }

  const hasBeenUpdated = props.value !== props.originalValue;

  const classNames = [
    'cell',
    'cell_record',
    props.group ? `cell-grouped` : 'cell-no_grouped',
  ];

  if (props.group?.collapsed) {
    classNames.push('cell-hidden');
  }

  if (props.isSticky) {
    classNames.push('cell-sticky');
  }

  if (props.isEditing) {
    classNames.push('cell-editing');
    classNames.push(`cell__editing_${props.row.dataField}`);
  } else if (props.isSelected) {
    classNames.push('cell-selected');
  } else if (hasBeenUpdated) {
    classNames.push('cell-updated');
  } else if (props.isActive) {
    classNames.push('cell-active');
  } else if (props.isStriped) {
    classNames.push('cell-striped');
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        props.onEscapeKeyDown();
        break;
      case 'Tab':
        event.preventDefault();
        event.stopPropagation();
        props.onTabKeyDown();
        break;
      case 'Enter':
        props.onEnterKeyDown();
        break;
      case 'z':
        if (event.ctrlKey) {
          props.onValueChange(props.originalValue);
        }
        break;
      default:
        break;
    }
  };

  return (
    <td
      key={props.key}
      class={classNames.join(' ')}
      data-primary-key={escapeDataAttribute(props.item[props.primaryKey])}
      data-data-field={escapeDataAttribute(props.row.dataField)}
      onKeyDown={handleKeyDown}
      onContextMenu={event => {
        props.onContextMenu(event);
      }}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        props.onClick();
      }}
      onDblClick={event => {
        event.preventDefault();
        event.stopPropagation();
        props.onDoubleClick();
      }}
      onMouseEnter={() => props.onMouseEnter()}
    >
      <item-cell
        isEditing={props.isEditing}
        primaryKey={props.primaryKey}
        data={props.item}
        group={props.group}
        row={props.row}
        originalValue={props.originalValue}
        value={props.value}
        onValueChange={event => props.onValueChange(event.detail)}
      />
    </td>
  );
}
