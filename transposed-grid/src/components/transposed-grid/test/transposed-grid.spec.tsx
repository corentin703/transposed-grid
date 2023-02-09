import { newSpecPage } from '@stencil/core/testing';
import { TransposedGrid } from '../transposed-grid';

describe('transposed-grid', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TransposedGrid],
      html: `<transposed-grid></transposed-grid>`,
    });
    expect(page.root).toEqualHtml(`
      <transposed-grid>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </transposed-grid>
    `);
  });
});
