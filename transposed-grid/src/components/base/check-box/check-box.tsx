import { h, Prop, Event, EventEmitter, Component, Host, Watch, State } from '@stencil/core';
import { CheckBoxTemplate } from '../../../models/checkbox';

export type CheckBoxChangeEvent = {
  isSelected: boolean
}

@Component({
  tag: 'check-box',
  styleUrl: 'check-box.scss',
  scoped: false,
})
export class Checkbox {
  @Prop() indeterminate?: boolean;
  @Prop() isSelected: boolean = false;

  @Prop() checkBoxTemplate?: CheckBoxTemplate;
  
  @Event() selectionChange!: EventEmitter<CheckBoxChangeEvent>;

  @State() public renderDefaultTemplate: boolean = true;

  private _customTemplateDestructor?: () => void;

  public connectedCallback() {
    this.watchToolbarTemplate();
  }

  @Watch('checkBoxTemplate')
  public watchToolbarTemplate() {
    this.renderDefaultTemplate = this.checkBoxTemplate === undefined;
  }

  render() {

    if (this._customTemplateDestructor) {
      this._customTemplateDestructor();
      this._customTemplateDestructor = undefined;
    }

    const renderCheckbox = () => {
      if (this.checkBoxTemplate) {
        const result = this.checkBoxTemplate({
          isSelected: this.isSelected,
          indeterminate: this.indeterminate,
          onSelectionChange: isSelected => this.selectionChange.emit({
            isSelected: isSelected,
          }),
        });

        if (result) {
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
  
          this._customTemplateDestructor = result.destructor;
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
        <div class={'checkbox'}>
          <input
            type={'checkbox'}
            checked={this.isSelected}
            indeterminate={this.indeterminate}
            onChange={event => {
              const checkBox = event.currentTarget as HTMLInputElement;
              this.selectionChange.emit({
                isSelected: checkBox.checked,
              });
            }}
          />
        </div>
      )
    }

    return (
      <Host>
        {renderCheckbox()}
      </Host>
    )
  }
}
