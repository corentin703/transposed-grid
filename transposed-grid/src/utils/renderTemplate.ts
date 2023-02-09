import { h, JSX } from '@stencil/core';

export function renderTemplate(element: HTMLElement, template: JSX.Element) {
  return h(element, template)
}
