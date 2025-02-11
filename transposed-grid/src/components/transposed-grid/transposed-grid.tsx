import { Component, Element, Event, EventEmitter, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { Data } from '../../models/data';
import { Group, GroupCollapsedEvent, GroupState } from '../../models/group';
import {
  EditActionType,
  EditEvent,
  EditEventType,
  EditingOptions,
  EditionResult,
  EditionResultEvent,
  RecordLevelOptions,
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
import { HeaderClickEvent, HeaderContextMenuEvent, ItemClickEvent, ItemContextMenuEvent, ItemDoubleClickEvent, ItemHooveringEvent } from '../../models/click';
import { SortOrder } from '../../models/sorting';
import { sortByDataField } from '../../utils/sortByDataField';
import { ToolbarOptions } from '../../models/toolbar';
import { ItemHeader } from '../header/ItemHeader';
import { ItemToolbarHeader } from '../header/ItemToolbarHeader';
import { ItemCellWrapper } from '../items/ItemCellWrapper';
import { ItemToolbarCell } from '../items/ItemToolbarCell';
import { CustomTemplate, CustomTemplateFactoryReturnType } from '../../models/customTemplate';
import { GroupHeader } from '../header/GroupHeader';

const FALLBACK_ROW_HEIGHT = '1.5rem';
const FALLBACK_GROUP_HEIGHT = '1.5rem';
const FALLBACK_CELL_WIDTH = '50px';

const UPDATE_CELL_DELTA = 5;

type EditingState = {
  itemIdx: number;
  row: Row;
}

type GroupedRows = {
  rows: Row[];
  group: GroupState;
}

type ItemMetadata = {
  inserted?: boolean;
  updated?: boolean;
  deleted?: boolean;

  selected?: boolean;
}

const mergeEditOptions = (editingOptions: EditingOptions, rowEditingOptions?: RecordLevelOptions, item?: any) => {
  if (!rowEditingOptions) {
    return editingOptions
  }

  if (!item || !editingOptions.optionRowName) {
    return {
      ...editingOptions,
      ...rowEditingOptions,
      allowUpdating: (editingOptions.allowUpdating === undefined || editingOptions.allowUpdating)
        && (rowEditingOptions.allowUpdating === undefined || rowEditingOptions.allowUpdating)
    }
  }

  const itemOptions = item[editingOptions.optionRowName] ?? { }

  return {
    ...editingOptions,
    ...rowEditingOptions,
    ...itemOptions,
    allowUpdating: (editingOptions.allowUpdating === undefined || editingOptions.allowUpdating)
      && (rowEditingOptions.allowUpdating === undefined || rowEditingOptions.allowUpdating)
      && (itemOptions.allowUpdating === undefined || itemOptions.allowUpdating)
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
  @Prop() public fixedGroups?: Group[];
  @Prop() public groups?: Group[];
  @Prop() public items: Data[] = [];
  @Prop() public primaryKey?: string;
  @Prop() public editing?: EditingOptions;
  @Prop() public selection?: SelectionOptions;
  
  @Prop() public scrollableGroupSectionHeight?: string;
  @Prop() public nonGroupSectionHeight?: string;

  @Prop() public toolbar?: ToolbarOptions;
  @Prop() toolbarTemplate?: (props: CustomTemplate<ToolbarOptions>) => CustomTemplateFactoryReturnType;

  @Prop() public allowSorting?: boolean;
  @Prop() public allowHeaderFiltering?: boolean;

  @Prop() public striped: boolean = true;

  @Prop() public maxPixelColumnWidth?: number;
  @Prop() public fixedColumnWidth?: string;

  @Prop() public focusedRowPrimaryKeyValue?: string;

  // Mouse events
  @Event() public itemClick!: EventEmitter<ItemClickEvent>;
  @Event() public itemDoubleClick!: EventEmitter<ItemDoubleClickEvent>;
  @Event() public itemHoovering!: EventEmitter<ItemHooveringEvent>;

  @Event() public itemContextMenu!: EventEmitter<ItemContextMenuEvent>;
  
  @Event() public headerClick!: EventEmitter<HeaderClickEvent>;
  @Event() public headerContextMenu!: EventEmitter<HeaderContextMenuEvent>;

  // Edition events
  @Event() public editionStarted!: EventEmitter<EditionResultEvent>;
  @Event() public editionValidation!: EventEmitter<EditionResultEvent>;
  @Event() public editionEnded!: EventEmitter<EditionResultEvent>;
  @Event() public save!: EventEmitter<EditionResultEvent>;
  @Event() public cancel!: EventEmitter<EditionResultEvent>;

  @Event() public itemSelectionChange!: EventEmitter<SelectionEvent>;

  @Event() public groupCollapsed!: EventEmitter<GroupCollapsedEvent>;
  @Event() public contentRendered!: EventEmitter<void>;

  @State() public groupsState?: GroupState[];
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
  
  @State() public cssState?: string

  private _primaryKey!: string;
  private _groupedRows?: GroupedRows[];
  private _nonGroupRow?: Row[];

  private _dataSnapshot?: Data[];
  private _itemsMetadata: Map<string, ItemMetadata> = new Map();

  private _rootElementRef!: HTMLDivElement;
  private _isFirstRender: boolean = true;

  private _nonGroupTableContainer!: HTMLDivElement;
  private _fixedGroupTableContainers: Record<string, HTMLDivElement> = {};
  private _groupTableContainers: Record<string, HTMLDivElement> = {};
  private _toolbarTableContainer!: HTMLDivElement;
  private _groupTableSectionRef!: HTMLElement;

  private _mustRedraw: boolean = true;
  private _lastMaxHeaderWidth?: number;
  private _lastGroupHeaderHeight: Record<string, number> = {};
  private _lastFieldHeight: Record<string, number> = {};
  private _lastRecordWidth: Record<string, number> = {};

  public connectedCallback() {
    this._dataSnapshot = undefined;

    this.watchItems(this.items);
    this.watchGroups();
    this.watchEditingOptions(this.editing);
    this.watchSelectionOptions(this.selection);
    this.setDataFields(this.rows);
    this.updateToolbar();
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

  @Watch('isEditingState')
  public watchEditing(newValue: boolean, oldValue: boolean) {
    if (newValue === oldValue) {
      return;
    }

    const eventDetails = {
      ...this._getAlteredData(),
      data: this.dataState,
      original: this._dataSnapshot ?? [],
      cancelEdit: false,
    };

    const eventToEmit = newValue ? this.editionStarted : this.editionEnded;
    const eventResult = eventToEmit.emit(eventDetails);
    if (eventResult.defaultPrevented || eventResult.detail.cancelEdit) {
      this.isEditingState = oldValue;
    }
  }


  @Watch('groups')
  @Watch('fixedGroups')
  public watchGroups() {
    const groups = this.groups ?? [];
    const fixedGroups = this.fixedGroups ?? [];

    this.groupsState = [
      ...fixedGroups.map(group => ({ ...group, isFixed: true })),
      ...groups.map(group => ({ ...group, isFixed: false })),
    ];
  }

  @Watch('groupsState')
  @Watch('fixedGroupsState')
  @Watch('rowsState')
  @Watch('dataState')
  public watchRedraw() {
    this._mustRedraw = true;
  }

  @Watch('editing')
  public watchEditingOptions(editing?: EditingOptions) {
    const texts = editing?.texts ?? { };

    texts.cancel = 'Cancel';
    texts.editRow = 'Edit';
    texts.save = 'Save';

    this.editingOptionsState = {
      ...this.editing,
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

    if (!this.items || this.items.length === 0) {
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
      return;
    }

    this.rowsState.forEach(row => {
      const group = row?.group && groupedRows.has(row.group)
        ? groupedRows.get(row.group)!.group
        : this.groupsState?.find(group => group.name === row?.group);

      const newRow = {
        visible: true,
        ...row,
      };

      if (!group) {
        nonGroupRow.push(newRow);
        return;
      }

      if (!groupedRows.has(group.name)) {
        groupedRows.set(group.name, {
          rows: [],
          group: group,
        });
      }

      groupedRows.get(group.name)!.rows.push(newRow);
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

    if (this.editingOptionsState.allowUpdating) {
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
  
  @Method()
  public async saveEdit() {
    this._saveEdit();
  }

  @Method()
  public async redraw() {
    this._redraw();
  }

  @Method()
  public async cancelEdit() {
    this._cancelEdit();
  }

  public componentDidRender() {
    if (this._isFirstRender || this._mustRedraw) {
      setTimeout(() => this._redraw());
      this._mustRedraw = false;
      this._isFirstRender = false;
    }

    this.contentRendered.emit();
  }

  public render() {
    const tableClassNames = [
      'mdc-data-table__table',
      'mdc-data-table--sticky-header',
      `${this.striped ? 'transposed_table-striped' : ''}`,
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
        const isStriped = this.striped && itemIdx % 2 !== 0

        return (
          <ItemCellWrapper
            item={item}
            rowIndex={itemIdx}
            row={row}
            group={group}

            isSticky={group === undefined}

            isActive={isItemActive}
            isEditing={isEditing}
            isSelected={metadata.selected ?? false}
            isStriped={isStriped}

            primaryKey={this._primaryKey}
            value={item[row.dataField]}
            originalValue={originalItem ? originalItem[row.dataField] : undefined}
            onValueChange={updatedValue => this._handleValueChange(row, itemIdx, item, updatedValue)}

            onClick={() => this._handleCellClick(item, itemIdx, row)}
            onDoubleClick={() => this._handleCellDblClick(item, itemIdx, row)}
            onMouseEnter={() => this._handleItemMouseEnter(item, itemIdx)}
            onContextMenu={event => this._handleCellContextMenu(event, item, itemIdx)}

            onTabKeyDown={() => this._handleTabKeyDown()}
            onEnterKeyDown={() => this._handleEnterKeyDown()}
            onEscapeKeyDown={() => this._handleEscapeKeyDown()}
          />
        )
      })
    }

    return (
      <Host>
        <style>
          {this.cssState}
        </style>

        <div ref={ref => this._rootElementRef = ref!} class={'transposed-grid'}>
          <div class={'toolbar__container'}>
            <grid-toolbar
              {...this.toolbarOptionsState}
              toolbarTemplate={this.toolbarTemplate}
            />
          </div>
          <div 
            class={'table2_container'}
            onMouseLeave={() => this._handleTableMouseLeave()}
            onWheel={event => {
              if (this.nonGroupSectionHeight && this.scrollableGroupSectionHeight) {
                return;
              }

              if (this.scrollableGroupSectionHeight) {
                this._groupTableSectionRef.scrollBy(0, event.deltaY)
              }
            }}
          >
            <section 
              class={'table2_vscroll table2_section_container'}
              style={{ maxHeight: this.nonGroupSectionHeight, }}
            >
              <table class={'table2-header'}>
                <tbody>
                  {
                    this._nonGroupRow?.filter(_row => _row.visible).map(row => {
                      return (
                        <tr class={`cell_${row.dataField}`}>
                          <ItemHeader
                            isSticky={true}
                            row={row}
                            onClick={() => this._handleHeaderClick(row)}
                            onContextMenu={event => this._handleHeaderContextMenu(event, row)}
                          />
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
              <div class={'table2-data-container'} ref={ref => this._nonGroupTableContainer = ref!}>
                <table class={'table2-data'}>
                  <tbody>
                    {
                      this._nonGroupRow?.filter(_row => _row.visible).map(row => {
                        return (
                          <tr class={`cell_${row.dataField}`}>
                            {renderDataFieldRow(row)}
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              {
                this._groupedRows?.filter(state => state.group.isFixed)?.map(groupedRow => {

                  const groupHeader = (
                    <GroupHeader
                      group={groupedRow.group}
                      onToggle={() => this._toggleGroup(groupedRow.group)}
                    />
                  )

                  if (groupedRow.group.collapsed) {
                    return (
                      <div>
                        {groupHeader}
                      </div>
                    )
                  }

                  return (
                    <div>
                      {groupHeader}
                      <div class={'table2_section_container'}>
                        <table class={'table2-header'}>
                          <tbody>
                            {
                              groupedRow.rows.filter(_row => _row.visible).map(row => {

                                return (
                                  <tr class={`cell_${row.dataField}`}>
                                    <ItemHeader
                                      row={row}
                                      group={groupedRow.group}
                                      onClick={() => this._handleHeaderClick(row)}
                                      onContextMenu={event => this._handleHeaderContextMenu(event, row)}
                                    />
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </table>
                        <div class={'table2-data-container'} ref={ref => this._fixedGroupTableContainers[groupedRow.group.name] = ref!}>
                          <table class={'table2-data'}>
                            <tbody>
                              {
                                groupedRow.rows.filter(_row => _row.visible).map(row => {

                                  return (
                                    <tr class={`cell_${row.dataField}`}>
                                      {renderDataFieldRow(row, groupedRow.group)}
                                    </tr>
                                  )
                                })
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  )
                })
              }
            </section>
            <section 
              class={'table2_vscroll'} 
              ref={ref => this._groupTableSectionRef = ref!}
              style={{ maxHeight: this.scrollableGroupSectionHeight, }}
            >
              {
                this._groupedRows?.filter(state => !state.group.isFixed)?.map(groupedRow => {

                  const groupHeader = (
                    <GroupHeader
                      group={groupedRow.group}
                      onToggle={() => this._toggleGroup(groupedRow.group)}
                    />
                  )

                  if (groupedRow.group.collapsed) {
                    return (
                      <div>
                        {groupHeader}
                      </div>
                    )
                  }

                  return (
                    <div>
                      {groupHeader}
                      <div class={'table2_section_container'}>
                        <table class={'table2-header'}>
                          <tbody>
                            {
                              groupedRow.rows.filter(_row => _row.visible).map(row => {

                                return (
                                  <tr class={`cell_${row.dataField}`}>
                                    <ItemHeader
                                      row={row}
                                      group={groupedRow.group}
                                      onClick={() => this._handleHeaderClick(row)}
                                      onContextMenu={event => this._handleHeaderContextMenu(event, row)}
                                    />
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </table>
                        <div class={'table2-data-container'} ref={ref => this._groupTableContainers[groupedRow.group.name] = ref!}>
                          <table class={'table2-data'}>
                            <tbody>
                              {
                                groupedRow.rows.filter(_row => _row.visible).map(row => {

                                  return (
                                    <tr class={`cell_${row.dataField}`}>
                                      {renderDataFieldRow(row, groupedRow.group)}
                                    </tr>
                                  )
                                })
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  )
                })
              }
            </section>

            <section class={'table2_section_container'}>
              <table class={'table2-header'}>
                <tbody>
                  <tr>
                    <ItemToolbarHeader
                      selectionMode={this.selectionOptionsState.mode!}
                      selectionStatus={this.selectionState.status}
                      onSelectionChange={areSelected => this._selectAll(areSelected)}
                      onContextMenu={event => this._handleHeaderContextMenu(event)}
                    />
                  </tr>
                </tbody>
              </table>
              <div 
                class={'table2-data-container table2_xscroll'} 
                ref={ref => this._toolbarTableContainer = ref!}
                onScroll={() => {
                  if (!this._toolbarTableContainer) {
                    return;
                  }

                  if (this._nonGroupTableContainer) {
                    this._nonGroupTableContainer.scrollLeft = this._toolbarTableContainer.scrollLeft;
                  }
                  
                  Object.values(this._groupTableContainers).forEach(container => {
                    if (container) {
                      container.scrollLeft = this._toolbarTableContainer.scrollLeft;
                    }
                  });

                  Object.values(this._fixedGroupTableContainers).forEach(container => {
                    if (container) {
                      container.scrollLeft = this._toolbarTableContainer.scrollLeft;
                    }
                  });
                }}
              >
                <table class={'table2-data'}>
                  <tbody>
                    <tr>
                      {
                        this.dataState.map((item, itemIdx) => {
                          const metadata = this._getItemMetadata(item);
                          const isStriped = this.striped && itemIdx % 2 !== 0

                          return (
                            <ItemToolbarCell
                              selectionMode={this.selectionOptionsState.mode!}
                              item={item}
                              primaryKey={this._primaryKey}

                              isActive={this.activeItemIdxState === itemIdx}
                              isSelected={metadata.selected ?? false}
                              isStriped={isStriped}

                              onMouseEnter={() => this._handleItemMouseEnter(item, itemIdx)}
                              onSelectionChange={isSelected => this._select(itemIdx, isSelected)}
                              canDelete={this._can(item, EditActionType.Delete)}
                              onDelete={() => alert('delete !')}
                              onContextMenu={event => this._handleCellContextMenu(event, item, itemIdx)}
                            />
                          );
                        })
                      }
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </Host>
    );
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

  private _redraw() {
    this._updateCellDimensions();
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

  private _toggleGroup(group: GroupState) {
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

  // Rendering
  private _updateCellDimensions() {
    let updatedCssState = ''

    const getHeadersWidth = () => {
      const headerElements = Array.from(this._rootElementRef.getElementsByClassName('cell_header')) as HTMLDivElement[];
      let maxHeaderWidth = Math.max(...headerElements.map(el => el.clientWidth));
  
      if (this._lastMaxHeaderWidth && Math.abs(this._lastMaxHeaderWidth - maxHeaderWidth) < UPDATE_CELL_DELTA) {
        return this._lastMaxHeaderWidth;
      }
      
      if (this._isFirstRender) {
        maxHeaderWidth += 50;
      }

      this._lastMaxHeaderWidth = maxHeaderWidth;
      return maxHeaderWidth;
    }

    const headersWidth = getHeadersWidth();
    updatedCssState = `${updatedCssState}
      .cell_header, .cell_toolbar_header {
        min-width: ${headersWidth}px;
        width: ${headersWidth}px;
        max-width: ${headersWidth}px;
      }
    `;

    this.dataState.forEach(record => {
      const getRecordWidth = () => {
        const elements = Array.from(this._rootElementRef.getElementsByClassName(`cell_record_${record[this._primaryKey]}`)) as HTMLDivElement[];
        const width = Math.max(...elements.map(el => el.clientWidth));

        if (this.maxPixelColumnWidth && width > this.maxPixelColumnWidth) {
          return this.maxPixelColumnWidth;
        }

        if (Number.isNaN(width) || !Number.isFinite(width)) {
          return FALLBACK_CELL_WIDTH;
        }

        if (this._lastRecordWidth[record[this._primaryKey]] && Math.abs(this._lastRecordWidth[record[this._primaryKey]] - width) < UPDATE_CELL_DELTA) {
          return this._lastRecordWidth[record[this._primaryKey]];
        }
        
        this._lastRecordWidth[record[this._primaryKey]] = width;
        return width;
      };

      const width = this.fixedColumnWidth ?? `${getRecordWidth()}px`;
      updatedCssState = `${updatedCssState}
        .cell__toolbar_${record[this._primaryKey]}, .cell_record_${record[this._primaryKey]} {
          min-width: ${width};
          width: ${width};
          max-width: ${width};
        }
      `;
    });

    this.rowsState?.forEach(row => {
      const getRowHeight = () => {
        const headerElements = Array.from(this._rootElementRef.getElementsByClassName(`cell_header_${row.dataField}`)) as HTMLDivElement[];
        const cellElements = Array.from(this._rootElementRef.getElementsByClassName(`cell_${row.dataField}`)) as HTMLDivElement[];
  
        const height = Math.max(...headerElements.map(el => el.clientHeight), ...cellElements.map(el => el.clientHeight));

        if (row.maxPixelHeight && height > row.maxPixelHeight) {
          return row.maxPixelHeight;
        }
        
        if (Number.isNaN(height) || !Number.isFinite(height)) {
          return FALLBACK_ROW_HEIGHT;
        }
        
        if (this._lastFieldHeight[row.dataField] && Math.abs(this._lastFieldHeight[row.dataField] - height) < UPDATE_CELL_DELTA) {
          return this._lastFieldHeight[row.dataField];
        }
        
        this._lastFieldHeight[row.dataField] = height;

        return height;
      };

      const height = row.fixedHeight ?? `${getRowHeight()}px`;
      updatedCssState = `${updatedCssState}
        .cell_header_${row.dataField}, .cell_${row.dataField} {
          min-height: ${height};
          height: ${height};
          max-height: ${height};
        }
      `;
    });

    this.groupsState?.forEach(group => {
      const getHeight = () => {
        const groupHeadersElements = Array.from(this._rootElementRef.getElementsByClassName(`group_header_${group.name}`)) as HTMLDivElement[];
        const height = Math.max(...groupHeadersElements.map(el => el.clientHeight));

        if (Number.isNaN(height) || !Number.isFinite(height)) {
          return FALLBACK_GROUP_HEIGHT;
        }

        if (this._lastGroupHeaderHeight[group.name] && Math.abs(this._lastGroupHeaderHeight[group.name] - height) < UPDATE_CELL_DELTA) {
          return this._lastGroupHeaderHeight[group.name];
        }
        
        this._lastGroupHeaderHeight[group.name] = height;

        return height;
      }

      const maxHeight = getHeight();
      updatedCssState = `${updatedCssState}
        .group_header_${group.name}, .group_${group.name} {
          min-height: ${maxHeight}px;
          height: ${maxHeight}px;
          max-height: ${maxHeight}px;
        }
      `;
    });

    this.cssState = updatedCssState;
  }

  // Edit
  private _can(item: Data, action: EditActionType, row?: Row): boolean {
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

    setTimeout(() => this._updateCellDimensions());

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

    const updated = this.dataState?.filter(item => this._getItemMetadata(item).updated ?? false)
      .map((item, idx) => toEditEvent(item, idx, EditEventType.Updating));

    return {
      updated: updated ?? [],
    };
  }

  private _resetEdit(editingCancelled: boolean) {
    this.editingItemState = undefined;
    this.isEditingState = false;

    if (!editingCancelled) {
      this._dataSnapshot = this.dataState;
      return;
    }

    if (this._dataSnapshot) {
      this.dataState = this._dataSnapshot;
    } else {
      this.dataState = this.items;
    }
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
      
      if (nextRow.group) {
        const group = this.groupsState?.find(group => group.name === nextRow.group);
        if (group && group.collapsed) {
          orderedRowIdx++;
          continue;
        }
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

  private _handleItemClick(item: Data, itemIdx: number, options?: { preventSelection: boolean, row?: Row, }) {
    const primaryKeyValue = item[this._primaryKey];

    const itemClickEventResult = this.itemClick.emit({
      item: item,
      itemIdx: itemIdx,
      primaryKey: this.primaryKey,
      primaryKeyValue: primaryKeyValue,
      row: options?.row,
    });

    if (itemClickEventResult.defaultPrevented) {
      return;
    }

    if (this.selectionOptionsState.selectAction === SelectAction.Click && !options?.preventSelection) {
      const metadata = this._getItemMetadata(item);
      this._select(itemIdx, !metadata.selected);
    }
  }

  private _handleItemDblClick(item: Data, itemIdx: number, options?: { preventSelection: boolean, row?: Row }) {
    const primaryKeyValue = item[this._primaryKey]

    this.itemDoubleClick.emit({
      item: item,
      itemIdx: itemIdx,
      primaryKey: this.primaryKey,
      primaryKeyValue: primaryKeyValue,
      row: options?.row,
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
      row: row,
    });
  }

  private _handleCellDblClick(item: Data, itemIdx: number, row: Row) {
    let editionToggled = false;

    if (this.editingOptionsState.startEditAction === StartEditAction.DoubleClick) {
      editionToggled = this._toggleEdit(item, itemIdx, row);
    }

    this._handleItemDblClick(item, itemIdx, {
      preventSelection: editionToggled,
      row: row,
    });
  }

  private _handleCellContextMenu(event: MouseEvent, item: Data, itemIdx: number, row?: Row) {
    const primaryKeyValue = item[this._primaryKey];

    const eventResult = this.itemContextMenu.emit({
      item: item,
      itemIdx: itemIdx,
      primaryKey: this.primaryKey,
      primaryKeyValue: primaryKeyValue,
      row: row,
    });

    if (eventResult.defaultPrevented) {
      event.preventDefault();
      return;
    }
  }

  private _handleHeaderClick(row: Row) {
    const eventResult = this.headerClick.emit({
      row: row,
    });

    if (eventResult.defaultPrevented) {
      return;
    }

    this._sort(row);
  }

  private _handleHeaderContextMenu(event: MouseEvent, row?: Row) {
    const eventResult = this.headerContextMenu.emit({
      row: row,
    });

    if (eventResult.defaultPrevented) {
      event.preventDefault();
      return;
    }
  }
}
