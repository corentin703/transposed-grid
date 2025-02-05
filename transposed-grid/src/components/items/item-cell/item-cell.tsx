import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import { CellTemplate, EditCellTemplateMethods } from '../../../models/customTemplate';
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

  private _destructor?: void | (() => void);

  render() {
    const cellProps: CellTemplate = {
      primaryKey: this.primaryKey,
      data: this.data,
      group: this.group,
      row: this.row,
      originalValue: this.originalValue,
      value: this.value,
    };

    if (this._destructor && typeof(this._destructor) === 'function') {
      this._destructor();
      this._destructor = undefined;
    }

    const renderViewer = () => {
      if (this.row.cellTemplate) {
        const result = this.row.cellTemplate({
          ...cellProps,
        });

        if (result instanceof HTMLElement) {
          return (
            <div 
              ref={ref => {
                if (!ref) {
                  return;
                }

                ref.innerHTML = '';
                ref.append(result);
              }} 
            />
          );
        }

        if (typeof result === 'object') {
          this._destructor = result.destructor;
          return (
            <div 
              ref={ref => {
                if (!ref) {
                  return;
                }

                ref.innerHTML = '';
                ref.append(result.element);
              }} 
            />
          );
        }
      }

      return (
        <default-cell-template
          {...cellProps}
        />
      );
    };

    const renderEditing = () => {
      if (this.row.editionCellTemplate) {
        const result = this.row.editionCellTemplate({
          ...cellProps,
          onValueChange: (value) => {
            this.valueChange.emit(value);
          },
        });

        if (result instanceof HTMLElement) {
          return (
            <div 
              ref={ref => {
                if (!ref) {
                  return;
                }

                ref.innerHTML = '';
                ref.append(result);
              }} 
            />
          );
        }

        if (typeof result === 'object') {
          this._destructor = result.destructor;
          return (
            <div 
              ref={ref => {
                if (!ref) {
                  return;
                }

                ref.innerHTML = '';
                ref.append(result.element);
              }} 
            />
          );
        }
      }

      const onEditorRefLoaded = (editor?: EditCellTemplateMethods) => {
        editor?.focusInput();
        editor?.selectAll();
      };

      return (
        <default-cell-edit-template
          ref={onEditorRefLoaded}
          {...cellProps}
          onValueChange={event => {
            this.valueChange.emit(event.detail);
          }}
        />
      );
    };

    return (
      <Host>
        {this.isEditing ? renderEditing() : renderViewer()}
      </Host>
    );
  }
}
