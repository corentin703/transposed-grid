import { newE2EPage } from '@stencil/core/testing';

describe('default-cell-edit-template', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<default-cell-edit-template></default-cell-edit-template>');

    const element = await page.find('default-cell-edit-template');
    expect(element).toHaveClass('hydrated');
  });
});
