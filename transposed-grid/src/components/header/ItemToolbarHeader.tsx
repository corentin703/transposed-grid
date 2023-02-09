import { FunctionalComponent, h } from '@stencil/core';
import { SelectionMode, SelectionStatus } from '../../models/selection';
import { MdCheckbox } from '../material/MdCheckbox';

export type ItemToolbarHeaderProps = {
  selectionMode: SelectionMode;
  selectionStatus: SelectionStatus;
  onSelectionChange: (areSelected: boolean) => void;
}

export const ItemToolbarHeader: FunctionalComponent<ItemToolbarHeaderProps> = (props) => {
  return (
    <th
      class={'mdc-data-table__header-cell cell__toolbar_header'}
      onClick={() => {
        if (props.selectionStatus === SelectionStatus.All) {
          props.onSelectionChange(false)
        } else {
          props.onSelectionChange(true)
        }
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
