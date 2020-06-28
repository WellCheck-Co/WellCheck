import { p as patchBrowser, g as globals, b as bootstrapLazy } from './core-5be4e9d4.js';

patchBrowser().then(options => {
  globals();
  return bootstrapLazy([["x-layers-page",[[2,"x-layers-page",{"data":[8],"page":[8],"wireframe":[4],"mode":[1]}]]],["x-layers-container",[[2,"x-layers-container",{"data":[8],"mode":[1],"zoom":[2],"wireframe":[4]}]]],["x-layers-upload",[[6,"x-layers-upload",null,[[0,"drop","onFileDrop"],[0,"dragover","dragOverHandler"],[0,"input","onFileChange"]]]]],["x-layers-layer",[[2,"x-layers-layer",{"data":[8],"layer":[8],"wireframe":[4],"depth":[2],"mode":[1],"borderWidth":[32],"offset3d":[32],"texts":[32],"images":[32],"layers":[32]}]]],["x-layers-canvas",[[2,"x-layers-canvas",{"data":[8],"mode":[1],"wireframe":[4],"zoom":[2],"currentPage":[32]}]]],["x-layers",[[2,"x-layers",{"src":[1],"mode":[1],"zoom":[2],"wireframe":[4],"data":[32]},[[0,"fileUploaded","onFileUploaded"]]]]]], options);
});
