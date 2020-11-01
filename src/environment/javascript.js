/**
 * fold to svg (c) Robby Kraft
 */
import * as K from "../keys";

/**
 * this clone function is decent, except for:
 * - it doesn't detect recursive cycles
 * - weird behavior around Proxys
 */

export const clone = function (o) {
  // from https://jsperf.com/deep-copy-vs-json-stringify-json-parse/5
  let newO;
  let i;
  if (typeof o !== K.object) {
    return o;
  }
  if (!o) {
    return o;
  }
  if (Object.prototype.toString.apply(o) === "[object Array]") {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = clone(o[i]);
    }
    return newO;
  }
  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      // this is where a self-similar reference causes an infinite loop
      newO[i] = clone(o[i]);
    }
  }
  return newO;
};

export const recursive_freeze = function (input) {
  Object.freeze(input);
  if (input === undefined) {
    return input;
  }
  Object.getOwnPropertyNames(input).filter(prop => input[prop] !== null
    && (typeof input[prop] === K.object || typeof input[prop] === K._function)
    && !Object.isFrozen(input[prop]))
    .forEach(prop => recursive_freeze(input[prop]));
  return input;
};

export const recursive_assign = (target, source) => {
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === K.object && source[key] !== null) {
      if (!(key in target)) { target[key] = {}; }
      recursive_assign(target[key], source[key])
    } else if (typeof target === K.object && !(key in target)) {
      target[key] = source[key];
    }
  });
  return target;
};

export const get_object = (input) => {
  if (input == null) {
    return {};
  }
  if (typeof input === K.object && input !== null) {
    return input;
  }
  if (typeof input === K.string || input instanceof String) {
    try {
      const obj = JSON.parse(input);
      return obj;
    } catch (error) {
      return {};
    }
  }
  return {};
};
