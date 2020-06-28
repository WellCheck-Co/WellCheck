import { r as registerInstance, c as createEvent, h, H as Host } from './core-5be4e9d4.js';

const XlayersUpload = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.fileUploaded = createEvent(this, "fileUploaded", 7);
    }
    onFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (const file of Array.from(event.dataTransfer.files)) {
                // If dropped items aren't files, reject them
                if (file.kind === 'file') {
                    // we only accept one file (for now)
                    this.onFileChange(file.getAsFile());
                }
            }
        }
        else {
            // Use DataTransfer interface to access the file(s)
            for (const file of Array.from(event.dataTransfer.files)) {
                this.onFileChange(file);
                // we only accept one file (for now)
                return true;
            }
        }
        // Pass event to removeDragData for cleanup
        this.removeDragData(event);
    }
    dragOverHandler(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
    onFileChange(inputEvent) {
        let file;
        if (!inputEvent.target) {
            file = inputEvent;
        }
        else {
            const files = inputEvent.target.files || inputEvent.dataTransfer.files;
            if (!files.length) {
                return;
            }
            file = files[0];
        }
        if (file.name.endsWith('.sketch')) {
            this.fileUploaded.emit(file);
        }
    }
    removeDragData(event) {
        if (event.dataTransfer.items) {
            // Use DataTransferItemList interface to remove the drag data
            event.dataTransfer.items.clear();
        }
        else {
            // Use DataTransfer interface to remove the drag data
            event.dataTransfer.clearData();
        }
    }
    render() {
        return (h(Host, null, h("input", { ref: el => (this.fileBrowserRef = el), type: "file", accept: ".sketch" }), h("slot", null), h("footer", { class: "footer footer--full" }, h("span", null, h("a", { href: "https://github.com/xlayers/xlayers/issues/new", target: "__blank" }, "Give us your feedback", ' '), ' ', "\u25CF", h("a", { href: "https://opencollective.com/xlayers", target: "__blank" }, ' ', "Support us", ' ')), h("span", null, h("a", { href: "https://twitter.com/xlayers_", target: "__blank" }, h("img", { src: "https://xlayers.app/assets/twitter.png", alt: "Follow us on twitter" })), h("a", { href: "https://opencollective.com/xlayers", target: "__blank" }, h("img", { src: "https://xlayers.app/assets/github-circle.png", alt: "Find us on Github" }))), h("span", null, h("a", { href: "xlayers.dev" }, "Powered by xLayers Lite")))));
    }
    static get style() { return ".sc-x-layers-upload-h {\n  display: block;\n  position: relative;\n  -ms-flex-align: center;\n  align-items: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  height: 100%;\n  width: 100%;\n}\n\ninput[type=\'file\'].sc-x-layers-upload {\n  display: none;\n}\n\n.footer.sc-x-layers-upload {\n  display: -ms-flexbox;\n  display: flex;\n  bottom: -1px;\n  padding: 2px 16px;\n  font-size: .7em;\n  line-height: normal;\n  background: #212121;\n  color: #a5a3a3;\n  width: 220px;\n  height: 17px;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  -ms-flex-align: center;\n  align-items: center;\n  border-top: 1px solid #353535;\n  position: absolute;\n  border-radius: 0 0 2px 2px;\n}\n\n.footer--full.sc-x-layers-upload {\n  width: calc(100% - 30px);\n  z-index: 999;\n}\n\n.footer.sc-x-layers-upload span.sc-x-layers-upload b.sc-x-layers-upload a.sc-x-layers-upload {\n  color: rgb(220, 61, 106);\n  text-decoration: none;\n}\n\n.footer.sc-x-layers-upload a.sc-x-layers-upload {\n  color: #e3e3e3;\n  text-decoration: none;\n}\n\n.footer.sc-x-layers-upload a.sc-x-layers-upload img.sc-x-layers-upload {\n  width: 14px;\n  height: 14px;\n  margin: 0 5px;\n}"; }
};

export { XlayersUpload as x_layers_upload };
