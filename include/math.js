/* Math (c) Robby Kraft, MIT License */
var subtract = function subtract(v, u) {
  return v.map(function (n, i) {
    return n - (u[i] || 0);
  });
};
var cross2 = function cross2(a, b) {
  return a[0] * b[1] - a[1] * b[0];
};
var math = {
  core: {
    subtract: subtract,
    cross2: cross2,
  }
};
export default math;
