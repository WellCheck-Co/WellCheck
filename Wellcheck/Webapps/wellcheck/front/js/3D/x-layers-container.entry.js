import { r as registerInstance, h } from './core-5be4e9d4.js';

const XlayersViewerContainer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return (h("div", { class: "layers-container" }, h("x-layers-canvas", { ref: el => (this.element = el), data: this.data, mode: this.mode, zoom: this.zoom, wireframe: this.wireframe })));
    }
    static get style() { return ".sc-x-layers-container-h {\n  width: 100%;\n  height: 100%;\n  -ms-flex-pack: center;\n  justify-content: center;\n  position: absolute;\n  -webkit-transform: scale(1);\n  transform: scale(1);\n  -webkit-transform-origin: center;\n  transform-origin: center;\n}\n.layers-container.sc-x-layers-container {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-pack: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  min-height: 100%;\n  position: absolute;\n}\nx-layers-layer.sc-x-layers-container {\n  top: 0;\n  left: 0;\n  position: absolute;\n  will-change: transform;\n}"; }
};

export { XlayersViewerContainer as x_layers_container };
