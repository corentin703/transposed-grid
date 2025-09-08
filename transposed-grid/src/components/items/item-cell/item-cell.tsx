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

  private _customTemplateDestructor?: void | (() => void);
  private _customTemplateFocus: (() => void) | undefined;

  render() {
    const cellProps: CellTemplate = {
      primaryKey: this.primaryKey,
      data: this.data,
      group: this.group,
      row: this.row,
      originalValue: this.originalValue,
      value: this.value,
    };

    if (this._customTemplateDestructor && typeof(this._customTemplateDestructor) === 'function') {
      this._customTemplateDestructor();
      this._customTemplateDestructor = undefined;
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
          this._customTemplateDestructor = result.destructor;
          return (
            <div 
              ref={ref => {
                if (!ref) {
                  return;
                }

                ref.innerHTML = '';
                ref.append(result.element);

                if (result.constructor) {
                  requestAnimationFrame(() => {
                    result.constructor && result.constructor(ref);
                  });
                }
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
          this._customTemplateDestructor = result.destructor;
          this._customTemplateFocus = result.focus;
          return (
            <div 
              ref={ref => {
                if (!ref) {
                  return;
                }

                ref.innerHTML = '';
                ref.append(result.element);
                
                if (this._customTemplateFocus && typeof(this._customTemplateFocus) === 'function') {
                  this._customTemplateFocus();

                  if (result.constructor) {
                    requestAnimationFrame(() => {
                      result.constructor && result.constructor(ref);
                    });
                  }
                }
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

    const minHeight = this.row.dimensions?.minPixelHeight ? `${this.row.dimensions?.minPixelHeight}px` : undefined;
    const maxHeight = this.row.dimensions?.maxPixelHeight ? `${this.row.dimensions?.maxPixelHeight}px` : undefined;

    return (
      <Host>
        <div style={{ minHeight: minHeight, maxHeight: maxHeight, }}>
          {this.isEditing ? renderEditing() : renderViewer()}
        </div>
      </Host>
    );
  }
}
