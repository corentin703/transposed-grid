import { FunctionalComponent, h } from '@stencil/core';
import { Data } from '../../models/data';
import { SelectionMode } from '../../models/selection';
import { MdDelete } from '../../icons/md-delete';
import { MdCheckbox } from '../material/MdCheckbox';
import { escapeDataAttribute } from '../../utils/escapeDataAttribute';

export type ItemToolbarCellProps = {
  item: Data;
  primaryKey: string;

  isActive: boolean;
  isSelected: boolean;
  isStriped: boolean;
  selectionMode: SelectionMode;
  canDelete: boolean;

  onMouseEnter: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onSelectionChange: (isSelected: boolean) => void;
  onDelete: () => void;
}

export const ItemToolbarCell: FunctionalComponent<ItemToolbarCellProps> = (props) => {
  const classNames = [
    'mdc-data-table__cell',
    'cell__toolbar',
  ];

  if (props.isSelected) {
    classNames.push('cell-selected');
  } else if (props.isActive) {
    classNames.push('cell-active');
  } else if (props.isStriped) {
    classNames.push('cell-striped');
  }

  return (
    <td
      class={classNames.join(' ')}
      data-primary-key={escapeDataAttribute(props.item[props.primaryKey])}
      onClick={() => {
        props.onSelectionChange(!props.isSelected);
      }}
      onContextMenu={event => {
        props.onContextMenu(event);
      }}
      onMouseEnter={() => props.onMouseEnter()}
    >
      {
        props.selectionMode !== SelectionMode.None
          ? (
              <MdCheckbox
                isSelected={props.isSelected}
                onChange={isSelected => props.onSelectionChange(isSelected)}
              />
            )
          : <span />
      }
      {
        props.canDelete
          ? (
              <button
                class={'cell__btn-trash'}
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  props.onDelete()
                }}
              >
                <MdDelete />
              </button>
            )
          : <span />
      }
    </td>
  );
}
