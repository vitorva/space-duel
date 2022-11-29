import {
  tick,
  acceleration,
  reverse,
  friction,
  steeringRadius,
  height,
  width,
  maxHealth,
  vehicleWidth,
  vehicleHeight,
  bossWidth,
  bossHeight,
  bossMaxHealth,
} from './constants.js';
import { adjacent, position, opposite } from './util.js';

/**
 * A base class for representing moving objects.
 */
class MovingEntity {
  /**
   * Construct a MovingObject.
   * @param {*} id The identifier.
   * @param {*} timestamp The initialization timestamp in milliseconds.
   * @param {*} x The x coordinate.
   * @param {*} y The y coordinate.
   * @param {*} speed The speed expressed in pixels/second.
   * @param {*} angle The angle expressed in radians.
   */
  constructor(id, timestamp, x, y, speed, angle) {
    this.id = id;
    this.timestamp = timestamp;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
  }

  /**
   * Updates the state of the moving entity
   */
  move() {
    throw new Error('Not implemented');
  }

  /**
   * Draws the moving entity with context of the canvas
   */
  render() {
    throw new Error('Not implemented');
  }
}

/**
 * A class for representing rockets.
 * @augments MovingEntity
 */
class Rocket extends MovingEntity {
  /**
   * Construct a Rocket.
   * @param {*} id The identifier.
   * @param {*} timestamp The initialization timestamp.
   * @param {*} x The x coordinate.
   * @param {*} y The y coordinate.
   * @param {*} speed The speed expressed in pixels/second.
   * @param {*} angle The angle expressed in radians.
   */
  constructor(id, timestamp, x, y, speed, angle) {
    super(id, timestamp, x, y, speed, angle);
    this.created = timestamp;
  }

  /**
   * Updates the state of the moving entity
   */
  move() {
    // Update the time
    this.timestamp += tick;

    // Compute the x and y distances
    const distance = (this.speed / 1000) * tick;
    const xDistance = adjacent(distance, this.angle);
    const yDistance = opposite(distance, this.angle);

    // Update the position
    this.x = position(this.x + xDistance, width);
    this.y = position(this.y + yDistance, height);
  }

  /**
   * Draws the moving entity with context of the canvas
   * @param {*} context
   */
  render(context) {
    context.beginPath();
    context.arc(0, 0, 2, 0, Math.PI * 2);
    context.stroke();
  }
}

/**
 * A class for representing vehicles.
 * @augments MovingEntity
 */
class Vehicle extends MovingEntity {
  /**
   * Construct a Vehicle.
   * @param {*} id The identifier.
   * @param {*} timestamp The initialization timestamp.
   * @param {*} x The x coordinate.
   * @param {*} y The y coordinate.
   * @param {*} speed The speed expressed in pixels/second.
   * @param {*} angle The angle expressed in radians.
   * @param {*} color The color expressed in RGB hex code.
   */
  constructor(id, timestamp, x, y, speed, angle,
    isAccelerating, isReversing, isTurningLeft, isTurningRight, color) {
    super(id, timestamp, x, y, speed, angle);
    this.isAccelerating = isAccelerating;
    this.isReversing = isReversing;
    this.isTurningLeft = isTurningLeft;
    this.isTurningRight = isTurningRight;
    this.color = color;
    this.health = maxHealth;
  }

  /**
   * Updates the state of the moving entity
   */
  move() {
    // Update the time
    this.timestamp += tick;

    // Compute the speed
    this.speed *= friction;
    this.speed += acceleration * this.isAccelerating;
    this.speed -= reverse * this.isReversing;

    // Compute the arc distance and the steering angle
    const arcDistance = (this.speed / 1000) * tick;
    const steeringAngle = arcDistance / steeringRadius;
    this.angle += steeringAngle * this.isTurningRight;
    this.angle -= steeringAngle * this.isTurningLeft;

    // Compute the linear distance and the position
    const linearDistance = 2 * opposite(steeringRadius, steeringAngle / 2);
    const xDistance = adjacent(linearDistance, this.angle);
    const yDistance = opposite(linearDistance, this.angle);
    this.x = position(this.x + xDistance, width);
    this.y = position(this.y + yDistance, height);
  }

  /**
   * Draws the moving entity with context of the canvas
   * @param {*} context
   */
  render(context) {
    context.beginPath();
    context.lineTo(vehicleWidth, -vehicleHeight);
    context.lineTo(-vehicleWidth, -vehicleHeight);
    context.lineTo(-vehicleWidth, vehicleHeight);
    context.lineTo(vehicleWidth, vehicleHeight);
    context.lineTo(vehicleWidth, -vehicleHeight);
    context.strokeStyle = this.color;
    context.stroke();
  }
}

/**
 * A class for representing vehicles.
 * @augments Vehicle
 */
class PlayerVehicle extends Vehicle {
  /**
   * Construct a Vehicle.
   * @param {*} id The identifier.
   * @param {*} timestamp The initialization timestamp.
   * @param {*} isBlueTeam if it's joining the blue team, else red team
   */
  constructor(id, timestamp, isBlueTeam) {
    super(id, timestamp, 0, 0, 0, 0, 0, 0, 0, 0, 'rgb(255, 0, 0)');

    this.isBlueTeam = isBlueTeam;
    this.x = (width / 2) + ((width / 0.75) * (isBlueTeam ? -1 : 1));
    const heightRange = height / 5; // random y for the spawn to make it a bit more interesting
    this.y = height / 2 + Math.floor(Math.random() * heightRange) - (heightRange / 2);
    this.color = isBlueTeam ? '#1586ff' : '#f12a2a';
    this.angle = isBlueTeam ? 0 : 180;
  }

  /**
   * Updates the state of the moving entity
   */
  move() {
    super.move();
  }

  /**
   * Draws the moving entity with context of the canvas as an arrow
   * @param {*} context
   */
  render(context) {
    // the arrow
    context.beginPath();
    context.moveTo(0, -vehicleHeight / 2);
    context.lineTo(vehicleWidth / 4, 0);
    context.lineTo(0, vehicleHeight / 2);
    context.lineTo(vehicleWidth, 0);
    context.closePath();

    // The health line
    const percentHealth = this.health / maxHealth;
    context.moveTo(-vehicleWidth / 8, (-vehicleHeight / 2) * percentHealth);
    context.lineTo(-vehicleWidth / 4, (-vehicleHeight / 2) * percentHealth);
    context.lineTo(-vehicleWidth / 4, (vehicleHeight / 2) * percentHealth);
    context.lineTo(-vehicleWidth / 8, (vehicleHeight / 2) * percentHealth);
    context.closePath();

    // the fill color
    context.fillStyle = this.color;
    context.fill();
  }
}

class Boss extends Vehicle {
  constructor(id, timestamp, x, y) {
    super(id, timestamp, x, y, 0, 0, 0, 0, 0, 0, 'rgb(255, 0, 255)');
    this.health = bossMaxHealth;
  }

  /**
   * Draws the moving entity with context of the canvas
   * @param {*} context
   */
  render(context) {
    // the arrow
    context.beginPath();
    context.moveTo(0, -bossWidth / 2);
    context.lineTo(bossWidth / 4, 0);
    context.lineTo(0, bossWidth / 2);
    context.lineTo(bossWidth, 0);
    context.closePath();

    // The health line
    const percentHealth = this.health / maxHealth;
    context.moveTo(-bossWidth / 8, (-bossHeight / 2) * percentHealth);
    context.lineTo(-bossWidth / 4, (-bossHeight / 2) * percentHealth);
    context.lineTo(-bossWidth / 4, (bossHeight / 2) * percentHealth);
    context.lineTo(-bossWidth / 8, (bossHeight / 2) * percentHealth);
    context.closePath();

    // the fill color
    context.fillStyle = this.color;
    context.fill();
  }

  /**
   * Updates the state of the moving entity
   */
  move() {
    // Update the time
    this.timestamp += tick;

    // Compute the speed
    this.speed *= friction * friction;
    this.speed += acceleration * this.isAccelerating;
    this.speed -= reverse * this.isReversing;

    // Compute the arc distance and the steering angle
    const arcDistance = (this.speed / 1000) * tick;
    const steeringAngle = arcDistance / steeringRadius;
    this.angle += 0.07 * this.isTurningRight;
    this.angle -= 0.07 * this.isTurningLeft;

    // Compute the linear distance and the position
    const linearDistance = 2 * opposite(steeringRadius, steeringAngle / 2);
    const xDistance = adjacent(linearDistance, this.angle);
    const yDistance = opposite(linearDistance, this.angle);
    this.x = position(this.x + xDistance, width);
    this.y = position(this.y + yDistance, height);
  }
}

/**
 * A class for representing lasers.
 * @augments Rocket
 */
class Laser extends Rocket {
  constructor(id, timestamp, x, y, speed, angle, laserColor) {
    super(id, timestamp, x, y, speed, angle);
    this.laserColor = laserColor;
  }

  render(context) {
    const gradient = context.createLinearGradient(0, 0, 170, 0);
    gradient.addColorStop('0', this.laserColor);
    gradient.addColorStop('1.0', 'blue');
    context.strokeStyle = gradient;
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(20, 0);
    context.lineTo(30, 0);
    context.stroke();
  }
}

export {
  MovingEntity,
  Vehicle,
  PlayerVehicle,
  Rocket,
  Boss,
  Laser,
};
