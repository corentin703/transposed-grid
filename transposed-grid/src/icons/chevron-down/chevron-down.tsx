import { Component, h, Host, Prop } from '@stencil/core';
import { BaseIcon } from '../_base-icon';

@Component({
  tag: 'icon-chevron-down',
  styleUrl: 'chevron-down.scss',
  scoped: false,
})
export class ChevronDown {

  @Prop() size?: string;
  @Prop() color?: string;

  render() {
    return (
      <Host>
        <div
          style={{
            height: this.size,
            width: this.size,
            fill: this.color,
          }}
        >
          <i class={'icon-chevron-down'}></i>
        </div>
      </Host>
    )
  }
}
