import { FunctionalComponent, h } from '@stencil/core';
import { SelectionMode, SelectionStatus } from '../../models/selection';
import { MdCheckbox } from '../material/MdCheckbox';

export type ItemToolbarHeaderProps = {
  selectionMode: SelectionMode;
  selectionStatus: SelectionStatus;
  onSelectionChange: (areSelected: boolean) => void;
  onContextMenu: (event: MouseEvent) => void;
}

export const ItemToolbarHeader: FunctionalComponent<ItemToolbarHeaderProps> = (props) => {
  return (
    <th
      class={'cell_header mdc-data-table__header-cell cell_toolbar_header'}
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
              <MdCheckbox
                indeterminate={props.selectionStatus === SelectionStatus.Some}
                isSelected={props.selectionStatus === SelectionStatus.All}
                onChange={isSelected => props.onSelectionChange(isSelected)}
              />
            )
            : <span />
      }
    </th>
  );
}
