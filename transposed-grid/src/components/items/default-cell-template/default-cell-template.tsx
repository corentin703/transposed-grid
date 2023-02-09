import { Component, Host, h, Prop } from '@stencil/core';
import { CellTemplate } from '../../../models/customTemplate';
import { Data } from '../../../models/data';
import { Group } from '../../../models/group';
import { Row } from '../../../models/row';

function renderObject(object: any) {
  if (object instanceof Date) {
    return object.toUTCString();
  }

  return object.toString();
}

@Component({
  tag: 'default-cell-template',
  styleUrl: 'default-cell-template.scss',
  shadow: true,
})
export class DefaultCellTemplate implements CellTemplate {
  @Prop() public data!: Data;
  @Prop() public primaryKey!: string;
  @Prop() public group?: Group | undefined;
  @Prop() public row!: Row;
  @Prop() public value: any;
  @Prop() public originalValue: any;


  render() {
    const getItem = () => {
      switch (typeof this.value) {
        case "bigint":
        case "number":
          return (
            <div class={'cell-number'}>
              {this.value.toString()}
            </div>
          );
        case "object":
          return (
            <div>
              {renderObject(this.value)}
            </div>
          );
        case "string":
          return this.value;
        default:
          return this.value?.toString();
      }
    }

    return (
      <Host>
        <div class={'cell'}>
          {getItem()}
        </div>
      </Host>
    );
  }

}
