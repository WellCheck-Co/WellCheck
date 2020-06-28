import { r as registerInstance, h, H as Host, d as getElement } from './core-5be4e9d4.js';
import { T as TextService, C as CssBlocGenService, a as SvgBlocGenService, S as SymbolService, I as ImageService } from './index-fd910a3e.js';

const XlayersViewerLayer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.borderWidth = 1;
        this.offset3d = 20;
        this.texts = [];
        this.images = [];
        this.layers = [];
        this.text = new TextService();
        this.cssBlocGen = new CssBlocGenService();
        this.svgBlocGen = new SvgBlocGenService();
        this.resource = new SymbolService();
        this.image = new ImageService();
    }
    componentWillLoad() {
        this.loadText();
        this.applyHighlightStyles();
        this.applyLayerStyles();
        this.loadImage();
        this.loadShapes();
        this.loadLayers();
        this.modeChanged();
    }
    loadText() {
        if (this.text.identify(this.layer)) {
            const content = this.text.lookup(this.layer);
            if (content) {
                this.texts.push(content);
            }
        }
    }
    modeChanged() {
        if (this.mode === '3d') {
            this.enable3dStyle();
        }
        else {
            this.disable3dStyle();
        }
    }
    applyHighlightStyles() {
        const elementPosition = this.element.getBoundingClientRect();
        this.element.style.borderWidth = `${this.borderWidth}px`;
        this.element.style.left = `${elementPosition.left - this.borderWidth}px`;
        this.element.style.top = `${elementPosition.top - this.borderWidth}px`;
    }
    applyLayerStyles() {
        if (this.cssBlocGen.identify(this.layer)) {
            const rules = this.cssBlocGen.context(this.layer).rules;
            Object.entries(rules).forEach(([property, value]) => {
                this.element.style[property] = value;
            });
        }
    }
    loadImage() {
        if (this.image.identify(this.layer)) {
            const content = this.image.lookup(this.layer, this.data);
            if (content) {
                this.images.push(`data:image/png;base64,${content}`);
            }
        }
    }
    loadShapes() {
        if (this.svgBlocGen.identify(this.layer)) {
            this.svgBlocGen
                .render(this.layer)
                .forEach(file => this.images.push(`data:image/svg+xml;base64,${btoa(file.value)}`));
        }
    }
    loadLayers() {
        if (this.layer.layers) {
            this.layers = this.layer.layers;
        }
        else {
            this.loadSymbolMaster();
        }
    }
    loadSymbolMaster() {
        if (this.resource.identify(this.layer)) {
            const symbolMaster = this.resource.lookup(this.layer, this.data);
            if (symbolMaster) {
                this.layers = [symbolMaster];
            }
        }
    }
    enable3dStyle() {
        this.element.classList.add('is-3d-view');
        this.element.style.transform = `translateZ(${(this.depth * this.offset3d).toFixed(3)}px)`;
    }
    disable3dStyle() {
        this.element.classList.remove('is-3d-view');
        this.element.style.transform = `none`;
    }
    render() {
        return (h(Host, null, h("div", { style: {
                height: this.layer.frame.height + 'px',
                width: this.layer.frame.width + 'px'
            } }, this.layers.map(layer => (h("x-layers-layer", { class: 'layer ' + (this.wireframe ? 'wireframe' : ''), data: this.data, layer: layer, depth: this.depth + 1, mode: this.mode, wireframe: this.wireframe, "data-id": layer.do_objectID, "data-name": layer.name, "data-class": layer._class, style: {
                width: layer.frame.width + 'px',
                height: layer.frame.height + 'px'
            } }))), this.texts.map(text => (h("span", null, text))), this.images.map(image => (h("img", { src: image, style: { height: '100%', width: '100%' } }))))));
    }
    get element() { return getElement(this); }
    static get watchers() { return {
        "mode": ["modeChanged"]
    }; }
    static get style() { return ".sc-x-layers-layer-h {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-box-shadow: 0 0 0 1px transparent;\n  box-shadow: 0 0 0 1px transparent;\n  -webkit-transition: -webkit-box-shadow 0.1s linear, -webkit-transform 1s;\n  transition: -webkit-box-shadow 0.1s linear, -webkit-transform 1s;\n  transition: box-shadow 0.1s linear, transform 1s;\n  transition: box-shadow 0.1s linear, transform 1s, -webkit-box-shadow 0.1s linear, -webkit-transform 1s;\n  -webkit-transform-origin: 0 0;\n  transform-origin: 0 0;\n  -webkit-transform-style: preserve-3d;\n  transform-style: preserve-3d;\n  will-change: transform, transition;\n  display: block;\n}\n.sc-x-layers-layer-h:hover {\n  -webkit-box-shadow: 0 0 0 1px #51c1f8 !important;\n  box-shadow: 0 0 0 1px #51c1f8 !important;\n  background-color: rgba(81, 193, 248, 0.2);\n}\n.isCurrentLayer.sc-x-layers-layer-h {\n  -webkit-box-shadow: 0 0 0 1px #ee4743 !important;\n  box-shadow: 0 0 0 1px #ee4743 !important;\n  background-color: rgba(238, 71, 67, 0.2);\n}\n.wireframe.sc-x-layers-layer-h {\n  -webkit-box-shadow: 0 0 0 1px black;\n  box-shadow: 0 0 0 1px black;\n}"; }
};

export { XlayersViewerLayer as x_layers_layer };
