import { r as registerInstance, h, H as Host, d as getElement } from './core-5be4e9d4.js';

const XlayersViewerPage = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    componentWillLoad() {
        this.modeChanged();
    }
    modeChanged() {
        if (this.mode === '3d') {
            this.element.classList.add('is-3d-view');
        }
        else {
            this.element.classList.remove('is-3d-view');
        }
    }
    render() {
        return (h(Host, null, this.page.layers.map(layer => (h("x-layers-layer", { class: 'layer ' + (this.wireframe ? 'wireframe' : ''), data: this.data, layer: layer, depth: 1, mode: this.mode, wireframe: this.wireframe, "data-id": layer.do_objectID, "data-name": layer.name, "data-class": layer._class, style: {
                width: layer.frame.width + 'px',
                height: layer.frame.height + 'px'
            } })))));
    }
    get element() { return getElement(this); }
    static get watchers() { return {
        "mode": ["modeChanged"]
    }; }
    static get style() { return ".sc-x-layers-page-h {\n  display: block;\n  position: static;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: visible;\n  -webkit-transition: -webkit-transform 1s;\n  transition: -webkit-transform 1s;\n  transition: transform 1s;\n  transition: transform 1s, -webkit-transform 1s;\n}\n.wireframe.sc-x-layers-page-h {\n  -webkit-box-shadow: 0 0 0 1px black;\n  box-shadow: 0 0 0 1px black;\n}"; }
};

export { XlayersViewerPage as x_layers_page };
