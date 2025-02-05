import { Component, Host, h, Prop, State, Watch } from '@stencil/core';
import { ToolbarButtonOptions, ToolbarOptions } from '../../../models/toolbar';
import { GridToolbarButton } from '../GridToolbarButton';
import { CustomTemplate, CustomTemplateFactoryReturnType } from '../../../models/customTemplate';

@Component({
  tag: 'grid-toolbar',
  styleUrl: 'grid-toolbar.scss',
  shadow: true,
})
export class GridToolbar implements ToolbarOptions {
  @Prop() public left?: ToolbarButtonOptions[];
  @Prop() public center?: ToolbarButtonOptions[];
  @Prop() public right?: ToolbarButtonOptions[];

  @Prop() public toolbarTemplate?: (props: CustomTemplate<ToolbarOptions>) => CustomTemplateFactoryReturnType;

  @State() public renderDefaultTemplate: boolean = true;

  private _customTemplateDestructor?: () => void;

  public connectedCallback() {
    this.watchToolbarTemplate();
  }

  @Watch('toolbarTemplate')
  public watchToolbarTemplate() {
    this.renderDefaultTemplate = this.toolbarTemplate === undefined;
  }

  render() {
    if (this._customTemplateDestructor) {
      this._customTemplateDestructor();
      this._customTemplateDestructor = undefined;
    }

    const renderToolbar = () => {
      if (this.toolbarTemplate) {
        const result = this.toolbarTemplate({
          left: this.left,
          center: this.center,
          right: this.right,
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
        <div class={'toolbar'}>
          <div class={'toolbar__part'}>
            {this.left?.map((button, _) =>
              <GridToolbarButton
                {...button}
                onClick={() => button.onClick && button.onClick()}
              />
            )}
          </div>
          <div class={'toolbar__part'}>
            {this.center?.map((button, _) =>
              <GridToolbarButton
                {...button}
                onClick={() => button.onClick && button.onClick()}
              />
            )}
          </div>
          <div class={'toolbar__part'}>
            {this.right?.map((button, _) =>
              <GridToolbarButton
                {...button}
                onClick={() => button.onClick && button.onClick()}
              />
            )}
          </div>
        </div>
      )
    }

    return (
      <Host>
        {renderToolbar()}
      </Host>
    );
  }

}
