/* eslint-disable no-param-reassign */
/**
 * Return true if the input is a Number.
 * @param {*} input
 */
function isNum(input) {
  return typeof input === 'number';
}

/**
 * Return true if the input is an Integer.
 * @param {*} input
 */
function isInt(input) {
  return Number.isInteger(input);
}

/**
 * Generate random number between f and t.
 *
 * @param {Number} from
 * @param {Number} to
 */
function random(from, to) {
  if (!isInt(from) || !isInt(to)) {
    throw new Error('Invalid arguments');
  }
  return Math.floor(Math.random() * (to - from + 1) + from);
}

/**
 * Generate random colors.
 */
function randomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    color += letters[random(0, 15)];
  }
  return color;
}

/**
 * Converts degrees to radians.
 *
 * @param {Number} degrees
 */
function toRadians(degrees) {
  if (!isNum(degrees)) {
    throw new Error('Invalid arguments');
  }
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 * @param {Number} radians
 */
function toDegrees(radians) {
  if (!isNum(radians)) {
    throw new Error('Invalid arguments');
  }
  return radians * (180 / Math.PI);
}

/**
 * Computes the adjacent  of a triangle from an hypotenuse and an angle.
 *
 * @param {Number} hypotenuse
 * @param {Number} radians
 */
function adjacent(hypotenuse, radians) {
  if (!isNum(hypotenuse) || !isNum(radians)) {
    throw new Error('Invalid arguments');
  }
  return Math.cos(radians) * hypotenuse;
}

/**
 * Computes the opposite of a triangle from an hypotenuse and an angle.
 *
 * @param {Number} hypotenuse
 * @param {Number} angle
 */
function opposite(hypotenuse, radians) {
  if (!isNum(hypotenuse) || !isNum(radians)) {
    throw new Error('Invalid arguments');
  }
  return Math.sin(radians) * hypotenuse;
}

/**
 * Computes the position on a plan.
 *
 * @param {Number} coordinates
 * @param {Number} max
 */
function position(coordinates, max) {
  if (!isNum(coordinates) || !isNum(max)) {
    throw new Error('Invalid arguments');
  }
  if (coordinates >= 0) {
    return coordinates % max;
  }
  return ((coordinates % max) + max) % max;
}

/**
 * Calculates the distance between two points, (x1;y1) and (x2;y2).
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

/**
 * Check for collisions between a point an a circle.
 *
 * @param {Number} pX
 * @param {Number} pY
 * @param {Number} cX
 * @param {Number} cY
 * @param {Number} cR
 */
function collision(pX, pY, cX, cY, cR) {
  if (!isNum(pX) || !isNum(pY) || !isNum(cX) || !isNum(cY) || !isNum(cR)) {
    throw new Error('Invalid arguments');
  }
  return distance(pX, pY, cX, cY) < cR;
}

/**
 * Converts an angle in degrees to range [0;360[
 * @param degrees
 * @returns {number}
 */
function to360Range(degrees) {
  degrees %= 360;

  if (degrees < 0) {
    degrees += 360;
  }

  return degrees;
}

export {
  adjacent,
  collision,
  position,
  toRadians,
  toDegrees,
  opposite,
  random,
  randomColor,
  distance,
  to360Range,
};
