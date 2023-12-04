import { LitElement } from 'lit';
export default class OscdOpen extends LitElement {
    doc: XMLDocument;
    run(): Promise<void>;
}
