import { newE2EPage } from '@stencil/core/testing';

describe('item-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<item-cell></item-cell>');

    const element = await page.find('item-cell');
    expect(element).toHaveClass('hydrated');
  });
});
