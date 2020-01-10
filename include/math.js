/* Math (c) Robby Kraft, MIT License */
var clean_number = function clean_number(num) {
  var places = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;
  var crop = parseFloat(num.toFixed(places));
  if (countPlaces(crop) === Math.min(places, countPlaces(num))) {
    return num;
  }
  return crop;
};
var multiply_matrices2 = function multiply_matrices2(m1, m2) {
  return [m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1], m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3], m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5]];
};
var multiply_matrix2_vector2 = function multiply_matrix2_vector2(matrix, vector) {
  return [matrix[0] * vector[0] + matrix[2] * vector[1] + matrix[4], matrix[1] * vector[0] + matrix[3] * vector[1] + matrix[5]];
};
var make_matrix2_reflection = function make_matrix2_reflection(vector) {
  var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
  var angle = Math.atan2(vector[1], vector[0]);
  var cosAngle = Math.cos(angle);
  var sinAngle = Math.sin(angle);
  var cos_Angle = Math.cos(-angle);
  var sin_Angle = Math.sin(-angle);
  var a = cosAngle * cos_Angle + sinAngle * sin_Angle;
  var b = cosAngle * -sin_Angle + sinAngle * cos_Angle;
  var c = sinAngle * cos_Angle + -cosAngle * sin_Angle;
  var d = sinAngle * -sin_Angle + -cosAngle * cos_Angle;
  var tx = origin[0] + a * -origin[0] + -origin[1] * c;
  var ty = origin[1] + b * -origin[0] + -origin[1] * d;
  return [a, b, c, d, tx, ty];
};
var distance = function distance(a, b) {
  var dimension = a.length;
  var sum = 0;
  for (var i = 0; i < dimension; i += 1) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
};

var math = {
  core: {
    clean_number: clean_number,
    multiply_matrices2: multiply_matrices2,
    multiply_matrix2_vector2: multiply_matrix2_vector2,
    make_matrix2_reflection: make_matrix2_reflection,
    distance: distance,
  }
};

export default math;
