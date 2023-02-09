import { newE2EPage } from '@stencil/core/testing';

describe('default-cell-template', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<default-cell-template></default-cell-template>');

    const element = await page.find('default-cell-template');
    expect(element).toHaveClass('hydrated');
  });
});
