import { FunctionalComponent, h } from '@stencil/core';
import { SelectionMode, SelectionStatus } from '../../models/selection';
import { CheckBoxTemplate } from '../../models/checkbox';

export type ItemToolbarHeaderProps = {
  selectionMode: SelectionMode;
  selectionStatus: SelectionStatus;
  onSelectionChange: (areSelected: boolean) => void;
  onContextMenu: (event: MouseEvent) => void;
  checkBoxTemplate?: CheckBoxTemplate,
}

export const ItemToolbarHeader: FunctionalComponent<ItemToolbarHeaderProps> = (props) => {
  return (
    <th
      class={'cell_header cell_toolbar_header'}
      onClick={() => {
        if (props.selectionStatus === SelectionStatus.All) {
          props.onSelectionChange(false)
        } else {
          props.onSelectionChange(true)
        }
      }}
      onContextMenu={event => {
        props.onContextMenu(event);
      }}
    >
      {
        props.selectionMode === SelectionMode.Multiple
          ? (
              <check-box
                indeterminate={props.selectionStatus === SelectionStatus.Some}
                isSelected={props.selectionStatus === SelectionStatus.All}
                onCheckChange={event => props.onSelectionChange(event.detail.isSelected)}
                checkBoxTemplate={props.checkBoxTemplate}
              />
            )
            : <span />
      }
    </th>
  );
}
