import { h, Prop, Event, EventEmitter, Component, Host } from '@stencil/core';

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
  
  @Event() stateChange!: EventEmitter<CheckBoxChangeEvent>;

  render() {
    return (
      <Host>
        <div class={'checkbox'}>
          <input
            type={'checkbox'}
            checked={this.isSelected}
            indeterminate={this.indeterminate}
            onChange={event => {
              const checkBox = event.currentTarget as HTMLInputElement;
              this.stateChange.emit({
                isSelected: checkBox.checked,
              });
            }}
          />
        </div>
      </Host>
    )
  }
}
