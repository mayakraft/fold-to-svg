// append this library to be a part of the larger library
// const applyToRabbitEar = (FoldToSvg, ear) => {
//   const thisToSVG = function () {
//     return FoldToSvg(this, ...arguments);
//   };
//   ear.__prototypes__.cp.svg = thisToSVG;
//   ear.__prototypes__.graph.svg = thisToSVG;
// };

// const linker = function (library) {
//   // is RabbitEar?
//   if (typeof library.cp === "function"
//     && typeof library.graph === "function"
//     && typeof library.origami === "function") {
//     applyToRabbitEar(this, library);
//   }
// };

const linker = function (parent) {
  const FoldtoSVG = this;
  const thisToSVG = function () {
    return FoldtoSVG(this, ...arguments);
  };
  // if (parent.graph) { parent.graph.prototype.svg = thisToSVG; }
};

export default linker;
