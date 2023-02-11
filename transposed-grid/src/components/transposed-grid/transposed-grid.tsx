import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { Data } from '../../models/data';
import { Group, GroupCollapsedEvent } from '../../models/group';
import {
  EditActionType,
  EditEvent,
  EditEventType,
  EditingOptions,
  EditionResult,
  EditionResultEvent,
  RowEditingOptions,
  StartEditAction,
} from '../../models/edition';
import {
  SelectAction,
  SelectionEvent,
  SelectionMode,
  SelectionOptions,
  SelectionState,
  SelectionStatus,
} from '../../models/selection';
import { Row } from '../../models/row';
import { ClickEvent } from '../../models/click';
import { SortOrder } from '../../models/sorting';
import { sortByDataField } from '../../utils/sortByDataField';
import { ToolbarOptions } from '../../models/toolbar';
import { GroupHeader } from '../header/GroupHeader';
import { ItemHeader } from '../header/ItemHeader';
import { ItemToolbarHeader } from '../header/ItemToolbarHeader';
import { ItemCellWrapper } from '../items/ItemCellWrapper';
import { ItemToolbarCell } from '../items/ItemToolbarCell';
import { GroupPlaceholder } from '../GroupPlaceholder';
import { CustomTemplate } from '../../models/customTemplate';

type EditingState = {
  itemIdx: number;
  row: Row;
}

type GroupedRows = {
  rows: Row[];
  group: Group;
}

type ItemMetadata = {
  inserted?: boolean;
  updated?: boolean;
  deleted?: boolean;

  selected?: boolean;
}

const mergeEditOptions = (editingOptions: EditingOptions, rowEditingOptions?: RowEditingOptions, item?: any) => {
  if (!rowEditingOptions) {
    return editingOptions
  }

  if (!item || !editingOptions.optionRowName) {
    return {
      ...editingOptions,
      ...rowEditingOptions,
    }
  }

  const itemOptions = item[editingOptions.optionRowName] ?? { }

  return {
    ...editingOptions,
    ...rowEditingOptions,
    ...itemOptions,
  }
}

@Component({
  tag: 'transposed-grid',
  styleUrl: 'transposed-grid.scss',
  scoped: true,
})
export class TransposedGrid {
  @Element() public element!: HTMLElement;

  @Prop() public tableClass?: string;

  @Prop() public rows?: Row[];
  @Prop() public groups?: Group[];
  @Prop() public items: Data[] = [];
  @Prop() public primaryKey?: string;
  @Prop() public editing?: EditingOptions;
  @Prop() public selection?: SelectionOptions;

  @Prop() public toolbar?: ToolbarOptions;
  @Prop() toolbarTemplate?: (props: CustomTemplate<ToolbarOptions>) => void;

  @Prop() public allowSorting?: boolean;
  @Prop() public allowHeaderFiltering?: boolean;

  @Prop() public striped?: boolean;
  @Prop() public bordered?: boolean;

  @Prop() public focusedRowPrimaryKeyValue?: string;

  // Mouse events
  @Event() public itemClick!: EventEmitter<ClickEvent>;
  @Event() public itemDoubleClick!: EventEmitter<ClickEvent>;
  @Event() public itemHoovering!: EventEmitter<ClickEvent>;

  // Edition events
  @Event() public editionValidation!: EventEmitter<EditionResultEvent>;
  @Event() public save!: EventEmitter<EditionResultEvent>;
  @Event() public cancel!: EventEmitter<EditionResultEvent>;

  @Event() public itemSelectionChange!: EventEmitter<SelectionEvent>;

  @Event() public groupCollapsed!: EventEmitter<GroupCollapsedEvent>;

  @State() public groupsState?: Group[];
  @State() public rowsState?: Row[];
  @State() public dataFieldsState?: string[];
  @State() public isEditingState: boolean = false;
  @State() public editingItemState?: EditingState;
  @State() public dataState: Data[] = [];
  @State() public activeItemIdxState?: number;
  @State() public editingOptionsState: EditingOptions = {
    // allowAdding: false,
    // allowDeleting: false,
    allowUpdating: false,

    confirmDelete: true,
    startEditAction: StartEditAction.Click,
    texts: {
      // addRow: 'Add',
      cancel: 'Cancel',
      // deleteRow: 'Delete',
      editRow: 'Edit',
      save: 'Save',
      // undelete: 'Restore',
    },
  };

  @State() public selectionOptionsState: SelectionOptions = {
    allowSelectAll: false,
    mode: SelectionMode.None,
    selectAction: SelectAction.Click,
  };

  @State() public selectionState: SelectionState = {
    areAllSelected: false,
    selectedItems: [],
    status: SelectionStatus.None,
    mode: SelectionMode.None,
  };

  @State() public toolbarOptionsState: ToolbarOptions = { };

  private _primaryKey!: string;
  private _groupedRows?: GroupedRows[];
  private _nonGroupRow?: Row[];

  private _dataSnapshot?: Data[];
  private _itemsMetadata: Map<string, ItemMetadata> = new Map();


  public connectedCallback() {
    this.groupsState = this.groups;
    this.groupsState = this.groups;

    this._dataSnapshot = undefined;

    this.watchItems(this.items);
    this.watchGroups(this.groups);
    this.watchEditingOptions(this.editing);
    this.watchSelectionOptions(this.selection);
    this.setDataFields(this.rows);
    this.updateToolbar();

    // const rowSlots: Element[] = [];
    // for (let childrenIdx = 0; childrenIdx < this.element.children.length; childrenIdx++) {
    //   const slot = this.element.children.item(childrenIdx);
    //   const slotName = slot?.getAttribute('slot');
    //
    //   if (!slot || !slotName) {
    //     continue;
    //   }
    //
    //   if (slotName.startsWith('row')) {
    //     rowSlots.push(slot);
    //   }
    // }
  }

  @Watch('items')
  public watchItems(items?: Data[]) {
    if (!items) {
      this.dataState = [];
      this._dataSnapshot = undefined;
      return;
    }

    if (this.primaryKey === undefined) {
      throw new Error('Primary key is missing');
    }

    this._primaryKey = this.primaryKey;

    const primaryKeyValues = this.items.map(item => item[this.primaryKey!]);
    if (new Set(primaryKeyValues).size !== primaryKeyValues.length) {
      throw new Error('There is duplicates in primary keys values');
    }

    this.dataState = [...items];
    this._dataSnapshot = [...this.dataState];
  }

  @Watch('groups')
  public watchGroups(groups?: Group[]) {
    this.groupsState = groups;
  }

  @Watch('editing')
  public watchEditingOptions(editing?: EditingOptions) {
    const texts = editing?.texts ?? { };

    // texts.addRow = 'Add';
    texts.cancel = 'Cancel';
    // texts.deleteRow = 'Delete';
    texts.editRow = 'Edit';
    texts.save = 'Save';
    // texts.undelete = 'Restore';

    this.editingOptionsState = {
      ...this.editing,
      // allowAdding: editing?.allowAdding ?? false,
      // allowDeleting: editing?.allowDeleting ?? false,
      allowUpdating: editing?.allowUpdating ?? false,

      confirmDelete: editing?.confirmDelete ?? true,
      startEditAction: editing?.startEditAction ?? StartEditAction.Click,
      texts: texts,
    };
  }

  @Watch('selection')
  public watchSelectionOptions(selection?: SelectionOptions) {
    let allowSelectAll = false;

    if (selection && selection.mode === 'multiple') {
      allowSelectAll = selection.allowSelectAll ?? true;
    }

    this.selectionOptionsState = {
      ...selection,
      allowSelectAll: allowSelectAll,
      mode: selection?.mode ?? SelectionMode.None,
      selectAction: selection?.selectAction ?? SelectAction.Click,
    };
  }

  @Watch('rows')
  public setDataFields(rows?: Row[]) {
    if (!rows) {
      return;
    }

    const updatedDataFields = rows
      .map(row => row.dataField)
      .sort((p1, p2) => p1.localeCompare(p2));

    if (!this.dataFieldsState) {
      this.dataFieldsState = updatedDataFields;
      return;
    }

    const areDataFieldsIdentical = this.dataFieldsState.every(
      (dataField, idx) => updatedDataFields[idx] === dataField
    );

    if (!areDataFieldsIdentical) {
      this.dataFieldsState = updatedDataFields;
    }

    return;
  }

  @Watch('rows')
  @Watch('editingOptionsState')
  @Watch('items')
  public inferRows() {
    this.editingItemState = undefined;

    if (this.rows) {
      this.rowsState = this.rows.map(row => {
        return {
          ...row,
          editing: mergeEditOptions(this.editingOptionsState, row.editing),
        };
      });

      return;
    }

    const rows: Row[] = [];

    if (!this.items || this.items.length === 1) {
      this.rowsState = rows;
      return;
    }

    Object.keys(this.items[0]).forEach(dataField => {
      if (dataField === this.editingOptionsState.optionRowName) {
        return;
      }

      const givenRow = this.rowsState?.find(row => row.dataField === dataField);

      const newRow: Row = {
        dataField: dataField,
        visible: true,
        ...givenRow,
        editing: mergeEditOptions(this.editingOptionsState, givenRow?.editing),
        allowHeaderFiltering: this.allowHeaderFiltering && (givenRow?.allowHeaderFiltering ?? true),
        allowSorting: this.allowSorting && (givenRow?.allowSorting ?? true),
      };

      rows.push(newRow);
    });

    this.rowsState = rows;
  }

  @Watch('groupsState')
  @Watch('rowsState')
  public setGroupRow() {
    const groupedRows: Map<string, GroupedRows> = new Map()
    const nonGroupRow: Row[] = []

    if (!this.rowsState) {
      return {
        groupedRows: [],
        nonGroupRow: nonGroupRow,
      };
    }

    this.rowsState.forEach(row => {
      const group = row?.group && groupedRows.has(row.group)
        ? groupedRows.get(row.group)!.group
        : this.groupsState?.find(group => group.name === row?.group)

      const newRow = {
        visible: true,
        ...row,
      }

      if (!group) {
        nonGroupRow.push(newRow)
        return
      }

      if (!groupedRows.has(group.name)) {
        groupedRows.set(group.name, {
          rows: [],
          group: group,
        })
      }

      groupedRows.get(group.name)!.rows.push(newRow)
    })

    this._groupedRows = [...groupedRows.values()];
    this._nonGroupRow = nonGroupRow;
  }

  @Watch('toolbar')
  @Watch('isEditingState')
  @Watch('editingOptionsState')
  public updateToolbar() {
    if (!this.isEditingState) {
      this.toolbarOptionsState = this.toolbar ?? { };
    }

    const rightPart = [
      ...(this.toolbar?.right ?? []),
    ];

    const saveButtonIdx = rightPart.findIndex(btn => btn.caption === this.editingOptionsState.texts?.save);
    if (saveButtonIdx !== -1) {
      rightPart[saveButtonIdx].onClick = this._saveEdit.bind(this);
    } else {
      rightPart.push({
        caption: this.editingOptionsState.texts?.save,
        onClick: this._saveEdit.bind(this),
      });
    }

    const cancelButtonIdx = rightPart.findIndex(btn => btn.caption === this.editingOptionsState.texts?.cancel);
    if (cancelButtonIdx !== -1) {
      rightPart[cancelButtonIdx].onClick = this._cancelEdit.bind(this);
    } else {
      rightPart.push({
        caption: this.editingOptionsState.texts?.cancel,
        onClick: this._cancelEdit.bind(this),
      });
    }

    this.toolbarOptionsState = {
      ...this.toolbar,
      right: rightPart,
    };
  }

  @Listen('keydown')
  public onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        this._handleEscapeKeyDown();
        break;
      case 'Enter':
        this._handleEnterKeyDown();
        break;
      case 'Tab':
        this._handleTabKeyDown();
        break;
    }
  }

  public render() {
    const tableClassNames = [
      'mdc-data-table__table',
      'mdc-data-table--sticky-header',
      `${this.striped ? 'transposed_table-striped' : ''}`,
      `${this.bordered ? 'transposed_table-bordered' : ''}`,
    ];

    if (this.tableClass) {
      tableClassNames.push(this.tableClass)
    }

    const renderDataFieldRow = (row: Row, group?: Group) => {
      return this.dataState.map((item, itemIdx) => {
        const isEditing = 
          this.editingItemState !== undefined &&
          this.editingItemState.itemIdx === itemIdx && 
          this.editingItemState.row.dataField === row.dataField && 
          this.editingItemState.row.group === row.group

        const originalItem = this._dataSnapshot
          ? this._dataSnapshot[itemIdx]
          : item
        ;

        const metadata = this._getItemMetadata(item);
        const isItemActive = this.activeItemIdxState === itemIdx;

        return (
          <ItemCellWrapper
            data={item}
            rowIndex={itemIdx}
            row={row}
            group={group}

            isSticky={group === undefined}

            isActive={isItemActive}
            isEditing={isEditing}
            isSelected={metadata.selected ?? false}
            isStriped={itemIdx % 2 !== 0}

            primaryKey={this._primaryKey}
            value={item[row.dataField]}
            originalValue={originalItem ? originalItem[row.dataField] : undefined}
            onValueChange={updatedValue => this._handleValueChange(row, itemIdx, item, updatedValue)}

            onClick={() => this._handleCellClick(item, itemIdx, row)}
            onDoubleClick={() => this._handleCellDblClick(item, itemIdx, row)}
            onMouseEnter={() => this._handleItemMouseEnter(item, itemIdx)}

            onTabKeyDown={() => this._handleTabKeyDown()}
            onEnterKeyDown={() => this._handleEnterKeyDown()}
            onEscapeKeyDown={() => this._handleEscapeKeyDown()}
          />
        )
      })
    }

    return (
      <Host>
        <div class={'transposed-grid'}>
          <div class={'toolbar__container'}>
            <grid-toolbar
              {...this.toolbarOptionsState}
              toolbarTemplate={this.toolbarTemplate}
            />
          </div>
          <div class={'mdc-data-table table__container'}>
            <table
              class={tableClassNames.join(' ')}
              onMouseLeave={() => this._handleTableMouseLeave()}
            >
              <thead class={'mdc-data-table--sticky-header'}>
                {
                  this._nonGroupRow?.filter(_row => _row.visible).map(row => {
                    return (
                      <tr>
                        <ItemHeader
                          isSticky={true}
                          row={row}
                          onSort={() => this._sort(row)}
                        />
                        {renderDataFieldRow(row)}
                      </tr>
                    )
                  })
                }
              </thead>
              <tbody>
                {
                  this._groupedRows?.map(groupedRow => {
                    return [
                      <tr>
                        <GroupHeader
                          group={groupedRow.group}
                          onToggle={() => this._toggleGroup(groupedRow.group)}
                        />
                        {
                          this.dataState.map(_ => <GroupPlaceholder
                            group={groupedRow.group}
                            onToggle={() => this._toggleGroup(groupedRow.group)}
                            colSpan={this.dataState.length}
                          />)
                        }
                      </tr>,
                      ...groupedRow.rows.filter(_row => _row.visible).map(row => {

                        return (
                          <tr>
                            <ItemHeader
                              row={row}
                              group={groupedRow.group}
                              onSort={() => this._sort(row)}
                            />
                            {renderDataFieldRow(row, groupedRow.group)}
                          </tr>
                        )
                      }),
                    ]
                  })
                }
              </tbody>
              <tfoot>
                <tr>
                  <ItemToolbarHeader
                    selectionMode={this.selectionOptionsState.mode!}
                    selectionStatus={this.selectionState.status}
                    onSelectionChange={areSelected => this._selectAll(areSelected)}
                  />
                  {
                    this.dataState.map((item, itemIdx) => {
                      const metadata = this._getItemMetadata(item);

                      return (
                        <ItemToolbarCell
                          selectionMode={this.selectionOptionsState.mode!}
                          item={item}

                          isActive={this.activeItemIdxState === itemIdx}
                          isSelected={metadata.selected ?? false}
                          isStriped={itemIdx % 2 !== 0}

                          onMouseEnter={() => this._handleItemMouseEnter(item, itemIdx)}
                          onSelectionChange={isSelected => this._select(itemIdx, isSelected)}
                          canDelete={this._can(item, EditActionType.Delete)}
                          onDelete={() => alert('delete !')}
                        />
                      );
                    })
                  }
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Host>
    );
  }

  private _getItemMetadata(item: Data): ItemMetadata {
    const itemId = item[this._primaryKey];

    if (!this._itemsMetadata.has(itemId)) {
      this._itemsMetadata.set(itemId, {});
    }

    return this._itemsMetadata.get(itemId)!;
  }

  private _sort(rowToSort: Row) {
    this.editingItemState = undefined;
    let orderedBy = rowToSort.orderedBy ?? SortOrder.Desc;

    if (!this.rowsState || !rowToSort.allowSorting) {
      return;
    }

    const updatedRows = [
      ...this.rowsState,
    ];

    if (orderedBy === SortOrder.Desc) {
      orderedBy = SortOrder.Asc;
    } else {
      orderedBy = SortOrder.Desc;
    }

    this.rowsState.forEach((row, idx) => {
      if (row.dataField !== rowToSort.dataField) {
        updatedRows[idx].orderedBy = undefined;
        return;
      }

      updatedRows[idx] = {
        ...row,
        orderedBy: orderedBy,
      };
    })

    this.rowsState = updatedRows;

    if (!this.dataState) {
      return;
    }

    this.dataState = sortByDataField(this.dataState, item => item[rowToSort.dataField], orderedBy);

    if (this._dataSnapshot !== undefined) {
      this._dataSnapshot = sortByDataField(this._dataSnapshot, item => item[rowToSort.dataField], orderedBy);
    }
  }
  private _toggleGroup(group: Group) {
    if (!this.groupsState) {
      return;
    }

    const updatedGroups = [
      ...this.groupsState,
    ];

    const idx = updatedGroups.findIndex(_group => _group.name === group.name)
    const event: GroupCollapsedEvent = {
      group : group,
      rows: this.rowsState?.filter(rows => rows.group === group.name) ?? [],
      collapsed: !group.collapsed,
    }

    this.groupCollapsed.emit(event);

    updatedGroups[idx] = {
      ...group,
      collapsed: event.collapsed,
    };

    this.groupsState = updatedGroups;
  }

  // Edit
  private _can(item: Data, action: EditActionType, row?: Row): boolean {
    // if (action === EditActionType.Insert) {
    //   return this.editingOptionsState.allowAdding ?? false;
    // }
    //
    // if (action === EditActionType.Delete) {
    //   return this.editingOptionsState.allowDeleting ?? false;
    // }

    if (action !== EditActionType.Update) {
      return false
    }

    const rights = mergeEditOptions(this.editingOptionsState, row?.editing, item);

    const editingMetadata = this._getItemMetadata(item);

    const isInserting = editingMetadata.inserted;
    const isDeleting = editingMetadata.deleted;

    if (isInserting) {
      return rights.allowAdding ?? false;
    }

    if (isDeleting) {
      return rights.allowDeleting ?? false;
    }

    return rights.allowUpdating ?? false;
  }

  private _toggleEdit(item: Data, itemIdx: number, row: Row): boolean {
    if (!row) {
      return false;
    }

    if (!this._can(item, EditActionType.Update, row)) {
      return false;
    }

    this.editingItemState = {
      itemIdx: itemIdx,
      row: row,
    };

    return true;
  }

  private _handleValueChange(row: Row, itemIdx: number, item: Data, updatedValue: any) {
    if (!this.dataState) {
      return;
    }

    const updatedData = [
      ...this.dataState,
    ]

    const updatedItem: Data = {
      ...item,
    };

    updatedItem[row.dataField] = updatedValue
    const metadata = this._getItemMetadata(item);
    metadata.updated = true;

    updatedData[itemIdx] = updatedItem;
    this.dataState = updatedData;
    this.isEditingState = true;
  }

  private _getAlteredData(): EditionResult {
    const toEditEvent = (item: Data, itemIdx: number, eventType: EditEventType): EditEvent => {
      const editingMetadata = this._getItemMetadata(item);

      const original = !editingMetadata?.inserted && this._dataSnapshot
        ? this._dataSnapshot[itemIdx]
        : null
      ;

      return {
        original: original,
        item: item,
        itemIdx: itemIdx,
        primaryKey: this.primaryKey,
        primaryKeyValue: item[this._primaryKey],
        eventType: eventType,
      };
    };

    // const inserted = this.dataState?.filter(item => this._getItemMetadata(item).inserted ?? false)
    //   .map((item, idx) => toEditEvent(item, idx, EditEventType.Inserting));

    const updated = this.dataState?.filter(item => this._getItemMetadata(item).updated ?? false)
      .map((item, idx) => toEditEvent(item, idx, EditEventType.Updating));

    // const deleted = this.dataState?.filter(item => this._getItemMetadata(item).deleted ?? false)
    //   .map((item, idx) => toEditEvent(item, idx, EditEventType.Deleting));

    return {
      // inserted: inserted ?? [],
      updated: updated ?? [],
      // deleted: deleted ?? [],
    };
  }

  private _resetEdit(editingCancelled: boolean) {
    this.editingItemState = undefined;
    this.isEditingState = false;

    if (editingCancelled) {
      this._dataSnapshot = this.dataState;
      return;
    }

    if (this._dataSnapshot) {
      this.dataState = this._dataSnapshot;
    } else {
      this.dataState = this.items;
    }
  }

  private _saveEdit() {

    const eventDetails = {
      ...this._getAlteredData(),
      data: this.dataState,
      original: this._dataSnapshot ?? [],
      cancelEdit: false,
    };

    const validationEventResult = this.editionValidation.emit(eventDetails);
    if (validationEventResult.defaultPrevented || validationEventResult.detail.cancelEdit) {
      this._resetEdit(true);
      return;
    }

    this.save.emit(eventDetails);
    this._resetEdit(false);
  }

  private _cancelEdit() {
    const eventDetails = {
      ...this._getAlteredData(),
      data: this.dataState,
      original: this._dataSnapshot ?? [],
      cancelEdit: true,
    };

    const cancelEditEventResult = this.cancel.emit(eventDetails);

    if (cancelEditEventResult.defaultPrevented || !cancelEditEventResult.detail.cancelEdit) {
      return;
    }

    this._resetEdit(true);
  }

  private _handleEnterKeyDown() {
    this.editingItemState = undefined;
  }

  private _handleEscapeKeyDown() {
    this.editingItemState = undefined;
  }

  private _handleTabKeyDown() {
    if (!this.editingItemState || !this.rowsState) {
      return;
    }

    const findRowPredicate = (row: Row, targetRow: Row) => row.dataField === targetRow.dataField && row.group === targetRow.group;

    const currentRow = this.editingItemState?.row;
    let isResolved = false;

    const orderedRows = [
      ...this._nonGroupRow ?? [],
      ...this._groupedRows?.map(groupedRow => groupedRow.rows)?.flat() ?? [],
    ];

    let itemIndex = this.editingItemState.itemIdx;
    let orderedRowIdx = orderedRows.findIndex(row => findRowPredicate(row, currentRow)) + 1;

    do {
      const nextRow = orderedRows[orderedRowIdx];
      const item = this.dataState[itemIndex];

      if (!item) {
        this.editingItemState = undefined;
        break;
      }

      if (!nextRow) {
        itemIndex++;
        orderedRowIdx = 0;
        continue;
      }

      isResolved = this._toggleEdit(item, itemIndex, nextRow);
      orderedRowIdx++;
    } while (!isResolved)

  }

  //  Selection
  private _select(itemIdx: number, isSelected: boolean) {
    if (this.selectionOptionsState.mode === SelectionMode.None) {
      return;
    }

    if (this.selectionOptionsState.mode === SelectionMode.Single) {
      this.dataState.forEach(item => {
        const metadata = this._getItemMetadata(item);
        metadata.selected = false;
      });
    }

    const metadata = this._getItemMetadata(this.dataState[itemIdx]);
    metadata.selected = isSelected;

    const dataState = this.dataState = [
      ...this.dataState,
    ];

    this._updateSelection(dataState);
  }

  private _selectAll(areSelected: boolean) {
    if (this.selectionOptionsState.mode !== SelectionMode.Multiple) {
      return;
    }

    const dataState = this.dataState.map((item: any) => {
      const metadata = this._getItemMetadata(item);
      metadata.selected = areSelected;

      return item;
    });

    this._updateSelection(dataState);
  }

  private _updateSelection(dataState: Data[]) {
    const selectedData = dataState.filter(item => {
      const metadata = this._getItemMetadata(item);
      return metadata?.selected ?? false
    });

    const areAllSelected = selectedData.length === dataState.length;

    let selectionStatus: SelectionStatus = SelectionStatus.Some;
    if (areAllSelected) {
      selectionStatus = SelectionStatus.All;
    } else if (selectedData.length === 0) {
      selectionStatus = SelectionStatus.None;
    }

    const selectionState = {
      selectedItems: selectedData,
      mode: this.selectionOptionsState.mode!,
      areAllSelected: areAllSelected,
      status: selectionStatus,
    };

    const selectionEventResult = this.itemSelectionChange.emit(selectionState);
    if (selectionEventResult.defaultPrevented) {
      return;
    }

    this.selectionState = selectionState;
  }

  private _handleItemClick(item: Data, itemIdx: number, options?: { preventSelection: boolean }) {
    const primaryKeyValue = item[this._primaryKey];

    const itemClickEventResult = this.itemClick.emit({
      item: item,
      itemIdx: itemIdx,
      primaryKey: this.primaryKey,
      primaryKeyValue: primaryKeyValue
    });

    if (itemClickEventResult.defaultPrevented) {
      return;
    }

    if (this.selectionOptionsState.selectAction === SelectAction.Click && !options?.preventSelection) {
      const metadata = this._getItemMetadata(item);
      this._select(itemIdx, !metadata.selected);
    }
  }

  private _handleItemDblClick(item: Data, itemIdx: number, options?: { preventSelection: boolean }) {
    const primaryKeyValue = item[this._primaryKey]

    this.itemDoubleClick.emit({
      item: item,
      itemIdx: itemIdx,
      primaryKey: this.primaryKey,
      primaryKeyValue: primaryKeyValue
    });

    if (this.selectionOptionsState.selectAction === SelectAction.DoubleClick && !options?.preventSelection) {
      const metadata = this._getItemMetadata(item);
      this._select(itemIdx, !metadata.selected);
    }
  }

  private _handleItemMouseEnter(item: Data, itemIdx: number) {
    if (this.activeItemIdxState === itemIdx) {
      return;
    }

    const primaryKeyValue = item[this._primaryKey]

    const itemHooveringEventResult = this.itemHoovering.emit({
      item: item,
      itemIdx: itemIdx,
      primaryKey: this.primaryKey,
      primaryKeyValue: primaryKeyValue
    });

    if (itemHooveringEventResult.defaultPrevented) {
      return;
    }

    this.activeItemIdxState = itemIdx;
  }

  private _handleTableMouseLeave() {
    this.activeItemIdxState = undefined;
  }

  private _handleCellClick(item: Data, itemIdx: number, row: Row) {
    let editionToggled = false;

    if (this.editingOptionsState.startEditAction === StartEditAction.Click) {
      editionToggled = this._toggleEdit(item, itemIdx, row);
    }

    this._handleItemClick(item, itemIdx, {
      preventSelection: editionToggled,
    });
  }

  private _handleCellDblClick(item: Data, itemIdx: number, row: Row) {
    let editionToggled = false;

    if (this.editingOptionsState.startEditAction === StartEditAction.DoubleClick) {
      editionToggled = this._toggleEdit(item, itemIdx, row);
    }

    this._handleItemDblClick(item, itemIdx, {
      preventSelection: editionToggled,
    });
  }
}
