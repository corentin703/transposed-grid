import { newE2EPage } from '@stencil/core/testing';

describe('transposed-grid', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<transposed-grid></transposed-grid>');

    const element = await page.find('transposed-grid');
    expect(element).toHaveClass('hydrated');
  });
});
