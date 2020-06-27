import { r as registerInstance, h, H as Host, d as getElement } from './core-5be4e9d4.js';

const XlayersViewerCanvas = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.currentPage = null;
        this.currentZoomLevel = 1;
    }
    componentWillLoad() {
        this.modeChanged();
        this.currentPage = this.data.pages[0];
    }
    modeChanged() {
        if (this.mode === '3d') {
            this.element.classList.add('is-3d-view');
        }
        else {
            this.element.classList.remove('is-3d-view');
        }
    }
    // use async to wait for canvasRef to be defined
    async componentDidLoad() {
        this.canvasRef.style.transform = this.formatTransformStyle(this.canvasRef.style.transform, this.zoom);
        this.currentZoomLevel = this.zoom;
    }
    updateCurrentPage() {
        if (this.data) {
            this.currentPage = this.data.pages[0];
        }
    }
    formatTransformStyle(existingTransformStyle, zoomLevel) {
        const scaleStyleRegex = /(\([ ]?[\d]+(\.[\d]+)?[ ]?(,[ ]?[\d]+(\.[\d]+)?[ ]?)?\))/gim;
        return scaleStyleRegex.test(existingTransformStyle)
            ? existingTransformStyle.replace(scaleStyleRegex, `(${zoomLevel},${zoomLevel})`)
            : existingTransformStyle + ` scale(${zoomLevel},${zoomLevel})`;
    }
    render() {
        if (this.data) {
            return (h(Host, null, this.data.pages.map(page => (h("div", { class: 'canvas ' +
                    (page.do_objectID === this.currentPage.do_objectID
                        ? 'selected'
                        : ''), ref: el => (this.canvasRef = el) }, h("x-layers-page", { data: this.data, page: page, mode: this.mode, wireframe: this.wireframe, "data-id": page.do_objectID, "data-name": page.name, "data-class": page._class }))))));
        }
        return h(Host, null);
    }
    get element() { return getElement(this); }
    static get watchers() { return {
        "mode": ["modeChanged"],
        "data": ["updateCurrentPage"]
    }; }
    static get style() { return ".sc-x-layers-canvas-h {\n  display: block;\n  width: 100%;\n  height: 100%;\n  -webkit-transform: none;\n  transform: none;\n  -webkit-transform-style: preserve-3d;\n  transform-style: preserve-3d;\n  -webkit-transition: -webkit-transform 1s;\n  transition: -webkit-transform 1s;\n  transition: transform 1s;\n  transition: transform 1s, -webkit-transform 1s;\n}\n.is-3d-view.sc-x-layers-canvas-h {\n  -webkit-perspective: 9000px;\n  perspective: 9000px;\n  -webkit-transform: rotateY(22deg) rotateX(30deg);\n  transform: rotateY(22deg) rotateX(30deg);\n}\nimg.sc-x-layers-canvas {\n  left: 2px;\n  top: 2px;\n}\n.canvas.sc-x-layers-canvas {\n  display: none;\n  cursor: move;\n  left: 50%;\n  position: absolute;\n  -webkit-transform-style: preserve-3d;\n  transform-style: preserve-3d;\n  -webkit-transform-origin: 50% 50%;\n  transform-origin: 50% 50%;\n  -webkit-transform: translate3d(-50%, 50%, 0px) scale(1);\n  transform: translate3d(-50%, 50%, 0px) scale(1);\n}\n.canvas.sc-x-layers-canvas img.sc-x-layers-canvas {\n  opacity: 1;\n  -webkit-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear;\n}\n.canvas.sc-x-layers-canvas .hidden.sc-x-layers-canvas img.sc-x-layers-canvas {\n  opacity: 0;\n}\n.selected.sc-x-layers-canvas {\n  display: block;\n}"; }
};

export { XlayersViewerCanvas as x_layers_canvas };
