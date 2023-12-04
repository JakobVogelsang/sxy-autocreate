import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { newEditEvent, Update } from '@openscd/open-scd-core';

const sxy = 'http://www.iec.ch/61850/2003/SCLcoordinates';
const esld = 'https://transpower.co.nz/SCL/SSD/SLD/v0';

function translate(element: Element, xOff: number, yOff: number): Update[] {
  if (element.closest('Private')) return [];

  const esldx = element.getAttributeNS(esld, 'x');
  const esldy = element.getAttributeNS(esld, 'y');
  if (!esldx || !esldy)
    return Array.from(element.children).flatMap(child =>
      translate(child, xOff, xOff)
    );

  const xAbs = esldx ? parseInt(esldx, 10) : 0;
  const yAbs = esldy ? parseInt(esldy, 10) : 0;

  const xRel = xAbs - xOff;
  const yRel = yAbs - yOff;

  const childUpdates = Array.from(element.children).flatMap(child =>
    translate(child, xRel, yRel)
  );

  const update = {
    element,
    attributes: {
      'sxy:x': { namespaceURI: sxy, value: `${xRel}` },
      'sxy:y': { namespaceURI: sxy, value: `${yRel}` },
    },
  };

  return [update, ...childUpdates];
}

export default class OscdOpen extends LitElement {
  @property({ attribute: false })
  doc!: XMLDocument;

  async run() {
    const substation = this.doc.querySelector('Substation');
    if (!substation) return;
    this.dispatchEvent(newEditEvent(translate(substation, 0, 0)));
  }
}
