
const recursive_fill = function (target, source) {
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) { target[key] = {}; }
      recursive_fill(target[key], source[key])
    } else if (typeof target === "object" && !(key in target)) {
      target[key] = source[key];
    }
  });
};

export default recursive_fill;
