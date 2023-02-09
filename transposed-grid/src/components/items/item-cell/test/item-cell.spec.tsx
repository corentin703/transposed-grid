import { newSpecPage } from '@stencil/core/testing';
import { ItemCell } from '../item-cell';

describe('item-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ItemCell],
      html: `<item-cell></item-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <item-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </item-cell>
    `);
  });
});
