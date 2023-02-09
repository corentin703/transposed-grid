import { newSpecPage } from '@stencil/core/testing';
import { DefaultCellEditTemplate } from '../default-cell-edit-template';

describe('default-cell-edit-template', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [DefaultCellEditTemplate],
      html: `<default-cell-edit-template></default-cell-edit-template>`,
    });
    expect(page.root).toEqualHtml(`
      <default-cell-edit-template>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </default-cell-edit-template>
    `);
  });
});
