import { FunctionalComponent, h } from '@stencil/core';
import { Data } from '../../models/data';
import { SelectionMode } from '../../models/selection';
import { DeleteIcon } from '../../icons/delete';
import { escapeDataAttribute } from '../../utils/escapeDataAttribute';
import { CheckBoxTemplate } from '../../components';
import { ColumnResizeEvent } from '../../models/toolbar';
import { ResizeHandler } from './ResizeHandler';
import { Ref } from '../../models';

export type ItemToolbarCellProps = {
  key: string | number;
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
  onResize: (event: ColumnResizeEvent) => void;

  checkBoxTemplate?: CheckBoxTemplate,
}

export const ItemToolbarCell: FunctionalComponent<ItemToolbarCellProps> = (props) => {
  const classNames = [
    'cell__toolbar',
  ];

  if (props.isSelected) {
    classNames.push('cell-selected');
  } else if (props.isActive) {
    classNames.push('cell-active');
  } else if (props.isStriped) {
    classNames.push('cell-striped');
  }

  const tdRef: Ref<HTMLTableCellElement | undefined> = {
    current: undefined,
  };
  
  return (
    <td
      key={props.key}
      ref={ref => tdRef.current = ref}
      class={classNames.join(' ')}
      data-primary-key={escapeDataAttribute(props.item[props.primaryKey])}
      onClick={() => {
        // props.onSelectionChange(!props.isSelected);
      }}
      onContextMenu={event => {
        props.onContextMenu(event);
      }}
      onMouseEnter={() => props.onMouseEnter()}
    >
      {
        props.selectionMode !== SelectionMode.None
          ? (
              <check-box
                isSelected={props.isSelected}
                onCheckChange={event => props.onSelectionChange(event.detail.isSelected)}
                checkBoxTemplate={props.checkBoxTemplate}
              />
            )
          : <span />
      }
      {
        props.canDelete
          ? (
              <button
                title="delete"
                class={'cell__btn-trash'}
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  props.onDelete()
                }}
              >
                <DeleteIcon />
              </button>
            )
          : <span />
      }

      <ResizeHandler
        key={props.item[props.primaryKey]}
        tdRef={tdRef}
        onResize={props.onResize}
      />
    </td>
  );
}
