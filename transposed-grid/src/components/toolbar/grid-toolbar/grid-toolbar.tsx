import { Component, Host, h, Prop, State, Watch } from '@stencil/core';
import { ToolbarButtonOptions, ToolbarOptions } from '../../../models/toolbar';
import { GridToolbarButton } from '../GridToolbarButton';
import { CustomTemplate } from '../../../models/customTemplate';

@Component({
  tag: 'grid-toolbar',
  styleUrl: 'grid-toolbar.scss',
  shadow: true,
})
export class GridToolbar implements ToolbarOptions {
  @Prop() public left?: ToolbarButtonOptions[];
  @Prop() public center?: ToolbarButtonOptions[];
  @Prop() public right?: ToolbarButtonOptions[];

  @Prop() public toolbarTemplate?: (props: CustomTemplate<ToolbarOptions>) => void;

  @State() public renderDefaultTemplate: boolean = true;

  public connectedCallback() {
    this.watchToolbarTemplate();
  }

  @Watch('toolbarTemplate')
  public watchToolbarTemplate() {
    this.renderDefaultTemplate = this.toolbarTemplate === undefined;
  }

  render() {
    if (!this.renderDefaultTemplate) {
      const onTemplateContainerElementLoaded = (element: HTMLElement) => {
        const renderDefaultTemplate = () => {
          this.renderDefaultTemplate = true;
        };

        if (this.toolbarTemplate === undefined) {
          renderDefaultTemplate();
          return;
        }

        this.toolbarTemplate({
          left: this.left,
          center: this.center,
          right: this.right,

          element: element,
          renderDefault: renderDefaultTemplate,
        });
      };

      return (
        <Host>
          <div
            ref={(element) => {
              if (!element) {
                return;
              }

              onTemplateContainerElementLoaded(element);
            }}
          />
        </Host>
      );
    }

    return (
      <Host>
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
      </Host>
    );
  }

}
