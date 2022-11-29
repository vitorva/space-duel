/* eslint-disable no-else-return */
import {
  rocketTTL,
  rocketIncrement,
  collisionRadius,
  keysValues,
  width,
  height,
  rocketNoCollisionDelay,
  maxHealth,
} from './constants.js';

import { PlayerVehicle, Boss, Laser } from './model.js';
import { collision } from './util.js';
import { Message } from './message.js';

/**
 * A class to manage the state of the game.
 */
export class Game extends Map {
  /**
   * Construct a Game object
   */
  constructor(messageListener) {
    super();
    this.messageListener = messageListener;
    this.counter = 0;
    this.totalBluePlayer = 0;
    this.totalRedPlayer = 0;
    this.pointsRed = 0;
    this.pointsBlue = 0;
    this.start = new Date().getTime();
    this.counter = 0;
    this.firstMove = true;
  }

  /**
   * Compute the current game timestamp.
   */
  timestamp() {
    return new Date().getTime() - this.start;
  }

  /**
   * Return the vehicles.
   */
  * vehicles() {
    for (const e of this.values()) {
      if (!(e instanceof Laser)) { // All that is not a laser is a Vehicle
        yield e;
      }
    }
  }

  /**
   * Return the rockets.
   */
  * rockets() {
    for (const e of this.values()) {
      if (e instanceof Rocket) {
        yield e;
      }
    }
  }

  /**
   * Return the lasers.
   */
  * lasers() {
    for (const e of this.values()) {
      if (e instanceof Laser) {
        yield e;
      }
    }
  }

  /**
   * Generate a unique identifier for storing and synchronizing objects.
   */
  id() {
    return this.counter++;
  }

  /**
   * Initialize a vehicle and set a new key-value pair in the class map,
   * then return the ID of the new-created vehicle.
   *
   * @param isBoss boolean, true if it's the boss joining the game
   * @returns {*}
   */
  join(isBoss) {
    const id = this.id();
    const timestamp = this.timestamp();
    let vehicle;

    if (isBoss) {
      vehicle = new Boss(id, timestamp, width / 2, height / 2);
    } else {
      const joinAsBlue = this.totalRedPlayer > this.totalBluePlayer;

      if (joinAsBlue) {
        this.totalBluePlayer++;
      } else {
        this.totalRedPlayer++;
      }
      vehicle = new PlayerVehicle(id, timestamp, joinAsBlue);
    }

    this.set(id, vehicle);
    this.messageListener(new Message('join', timestamp));

    for (const entity of this.values()) {
      this.messageListener(new Message('set', entity));
    }

    return id;
  }

  /**
   * Delete a vehicle by its id.
   *
   * @param id
   */
  quit(id) {
    const vehicle = this.get(id);

    if (vehicle instanceof PlayerVehicle) {
      if (vehicle.isBlueTeam) {
        this.totalBluePlayer--;
        this.pointsRed++;
      } else {
        this.totalRedPlayer--;
        this.pointsBlue++;
      }
    }

    this.delete(id);
    this.messageListener(new Message('delete', id));
  }

  /**
   * Handle the player messages.
   *
   * @param id
   * @param message
   */
  onMessage(id, message) {
    const vehicle = this.get(id);
    if (vehicle !== undefined) {
      const isKeydownEvent = message.action === 'keydown';
      switch (message.object) {
        case keysValues.arrowLeft:
          vehicle.isTurningLeft = isKeydownEvent;
          this.messageListener(new Message('set', vehicle));
          break;
        case keysValues.arrowRight:
          vehicle.isTurningRight = isKeydownEvent;
          this.messageListener(new Message('set', vehicle));
          break;
        case keysValues.arrowUp:
          vehicle.isAccelerating = isKeydownEvent;
          this.messageListener(new Message('set', vehicle));
          break;
        case keysValues.arrowDown:
          vehicle.isReversing = isKeydownEvent;
          this.messageListener(new Message('set', vehicle));
          break;
        case keysValues.space:
          if (isKeydownEvent) {
            const laser = new Laser(
              this.id(),
              this.timestamp(),
              vehicle.x,
              vehicle.y,
              vehicle.speed + rocketIncrement,
              vehicle.angle,
              vehicle.isBlueTeam ? 'rgb(0, 217, 255)' : 'rgb(255, 66, 66)',
            );
            this.set(laser.id, laser);
            this.messageListener(new Message('set', laser));
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * Moves the state of the game
   * Return true if the boss needs to be initialized
   */
  move() {
    const timestamp = this.timestamp();
    for (const entity of this.values()) {
      while (entity.timestamp < timestamp) entity.move();
    }
    for (const laser of this.lasers()) {
      const lifetime = laser.timestamp - laser.created;
      if (lifetime > rocketTTL) {
        this.quit(laser.id);
      } else if (lifetime > rocketNoCollisionDelay) {
        for (const vehicle of this.vehicles()) {
          if (collision(laser.x, laser.y, vehicle.x, vehicle.y, collisionRadius)) {
            vehicle.health = Math.max(vehicle.health - 1, 0);
            this.quit(laser.id);

            if (vehicle.health <= 0) {
              if (vehicle instanceof Boss) {
                this.quit(vehicle.id);
                return true;
              } else {
                vehicle.health = maxHealth;
                vehicle.x = width / 2;
                vehicle.y = height / 2;
                if (vehicle.isBlueTeam) {
                  this.pointsRed++;
                  this.messageListener(new Message('refreshRedPoints', this.pointsRed));
                } else {
                  this.pointsBlue++;
                  this.messageListener(new Message('refreshBluePoints', this.pointsBlue));
                }
              }
            }
            this.messageListener(new Message('set', vehicle));
          }
        }
      }
    }
    if (this.firstMove) {
      this.firstMove = false;
      return true;
    } else {
      return false;
    }
  }
}

export class Replica extends Map {
  constructor() {
    super();
    this.start = new Date().getTime();
  }

  /**
   * Compute the current game timestamp.
   */
  timestamp() {
    return new Date().getTime() - this.start;
  }

  onMessage(message) {
    switch (message.action) {
      case 'join':
        this.start = new Date().getTime() - message.object;
        break;
      case 'set':
        this.set(message.object.id, message.object);
        break;
      case 'delete':
        this.delete(message.object);
        break;
      case 'refreshRedPoints':
        document.getElementById('redScore').innerText = message.object;
        break;
      case 'refreshBluePoints':
        document.getElementById('blueScore').innerText = message.object;
        break;
      default:
        break;
    }
  }

  move() {
    const timestamp = this.timestamp();
    for (const entity of this.values()) {
      while (entity.timestamp < timestamp) entity.move();
    }
  }
}
