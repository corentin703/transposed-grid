import { Component, Host, h, EventEmitter, Prop, Event, Method } from '@stencil/core';
import { InternalEditCellTemplate, EditCellTemplateMethods } from '../../../../models/customTemplate';
import { Data } from '../../../../models/data';
import { Group } from '../../../../models/group';
import { Row } from '../../../../models/row';

@Component({
  tag: 'default-cell-edit-template',
  styleUrl: 'default-cell-edit-template.scss',
  shadow: true,
})
export class DefaultCellEditTemplate implements InternalEditCellTemplate, EditCellTemplateMethods {
  @Prop() public data!: Data;
  @Prop() public primaryKey!: string;
  @Prop() public group?: Group | undefined;
  @Prop() public row!: Row;
  @Prop() public originalValue: any;
  @Prop() public value: any;

  @Event() public valueChange!: EventEmitter<any>;

  private inputElement?: HTMLInputElement;

  // @Listen('focus')
  // public handleFocus(_: Event) {
  //   this.inputElement!.focus();
  // }

  @Method()
  public focusInput(options?: FocusOptions): Promise<void> {
    this.inputElement?.focus(options);
    return Promise.resolve();
  }

  @Method()
  public selectAll(): Promise<void> {
    this.inputElement?.select();
    return Promise.resolve();
  }

  private _onInputChanged(event: Event) {
    const inputElement = event.currentTarget as HTMLInputElement
    this.valueChange.emit(inputElement.value)
  }

  render() {
    return (
      <Host>
        <div class={'cell__edit'}>
          <input
            ref={el => this.inputElement = el as HTMLInputElement}
            class={'cell__edit-input'}
            type={'text'}
            value={this.value}
            onChange={event => {
              this._onInputChanged(event)
            }}
          />
        </div>
      </Host>
    );
  }

}
