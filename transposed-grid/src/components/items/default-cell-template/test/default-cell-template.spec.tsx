import { newSpecPage } from '@stencil/core/testing';
import { DefaultCellTemplate } from '../default-cell-template';

describe('default-cell-template', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [DefaultCellTemplate],
      html: `<default-cell-template></default-cell-template>`,
    });
    expect(page.root).toEqualHtml(`
      <default-cell-template>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </default-cell-template>
    `);
  });
});
