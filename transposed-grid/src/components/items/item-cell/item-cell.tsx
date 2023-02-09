import { Component, Host, h, Prop, Event, EventEmitter, State, Watch } from '@stencil/core';
import { CellTemplate, CustomEditCellTemplate, EditCellTemplateMethods } from '../../../models/customTemplate';
import { Data } from '../../../models/data';
import { Group } from '../../../models/group';
import { Row } from '../../../models/row';

@Component({
  tag: 'item-cell',
  styleUrl: 'item-cell.css',
  shadow: false,
})
export class ItemCell {
  @Prop() public isEditing: boolean = false;
  @Prop() public primaryKey!: string;
  @Prop() public data!: Data;
  @Prop() public group?: Group | undefined;
  @Prop() public row!: Row;
  @Prop() public value: any;
  @Prop() public originalValue: any;

  @Event() public valueChange!: EventEmitter<any>;

  @State() public renderDefaultTemplate: boolean = true;
  @State() public lastRenderedContainerElement?: HTMLElement;

  public connectedCallback() {
    this.watchTemplateStatus();
  }

  @Watch('isEditing')
  @Watch('row')
  public watchTemplateStatus() {
    // if (this.row.dataField === 'commonPhoto') {
    //   console.log(this.row)
    // }

    const renderDefaultTemplate = this.isEditing
      ? this.row.editionCellTemplate === undefined
      : this.row.cellTemplate === undefined
    ;

    if (this.renderDefaultTemplate !== renderDefaultTemplate) {
      this.renderDefaultTemplate = renderDefaultTemplate;
    }

    this.lastRenderedContainerElement = undefined;
  }

  render() {
    const cellProps: CellTemplate = {
      primaryKey: this.primaryKey,
      data: this.data,
      group: this.group,
      row: this.row,
      originalValue: this.originalValue,
      value: this.value,
    };

    const editCellProps: CustomEditCellTemplate = {
      ...cellProps,
      onValueChange: (event) => {
        this.valueChange.emit(event.detail);
      },
    };

    const getCellContent = () => {
      if (!this.isEditing) {
        return (
          <default-cell-template
            {...cellProps}
          />
        );
      }

      const onEditorRefLoaded = (editor?: EditCellTemplateMethods) => {
        editor?.focusInput();
        editor?.selectAll();
      };

      return (
        <default-cell-edit-template
          ref={onEditorRefLoaded}
          {...editCellProps}
          onValueChange={event => {
            this.valueChange.emit(event.detail);
          }}
        />
      );
    }

    if (this.renderDefaultTemplate) {
      return (
        <Host>
          {getCellContent()}
        </Host>
      );
    }

    const onTemplateContainerRefLoaded = (element: HTMLElement) => {
      // if (this.lastRenderedContainerElement?.isEqualNode(element)) {
      //   return;
      // }
      //
      // console.log(this.lastRenderedContainerElement?.isEqualNode(element), this.lastRenderedContainerElement = element, this.lastRenderedContainerElement, element)
      // this.lastRenderedContainerElement = element;

      const renderDefaultTemplate = () => {
        this.renderDefaultTemplate = true;
      }

      if (this.isEditing && this.row.editionCellTemplate) {
        this.row.editionCellTemplate({
          ...editCellProps,
          element: element,
          renderDefault: renderDefaultTemplate,
        });
        return;
      }

      if (!this.isEditing && this.row.cellTemplate) {
        this.row.cellTemplate({
          ...cellProps,
          element: element,
          renderDefault: renderDefaultTemplate,
        });
        return;
      }

      renderDefaultTemplate();
    }

    return (
      <Host>
        <div
          ref={element => {
            if (!element) {
              return;
            }

            onTemplateContainerRefLoaded(element);
          }}
        />
      </Host>
    );
  }
}
