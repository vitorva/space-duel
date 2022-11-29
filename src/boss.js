/* eslint-disable max-len */
import { Message } from './message.js';
import { keysValues } from './constants.js';
import { distance, toDegrees, to360Range } from './util.js';
import { bossMaxHealth } from "./constants.js";

// Boss's aiming angle will be precise to aimingAccuracy degrees
const aimingAccuracy = 3;

// Boss will search for closest target every targetAcquirementInterval ms
const targetAcquirementInterval = 5;

// Boss will approach its target from this distance at the closest
const approachDistance = 50;

// Interval between the bursts shots
const happyShotsInterval = 65;
const angryShotsInterval = 10;

// Interval between the stacks of shots
const happyBurstsInterval = 2000;
const angryBurstsInterval = 1000;

// Number of shot rockets in every burst
const happyShotsPerBurst = 3;
const angryShotsPerBurst = 10;

const moodUpdateInterval = 500;

export class BossController {
  constructor(game) {
    this.game = game;
    this.id = game.join(true);
    this.vehicle = this.game.get(this.id);
    this.target = null;
    this.pressedRotationKey = null;

    this.shotsPerBurst = happyShotsPerBurst;
    this.burstsInterval = happyBurstsInterval;
    this.shotsInterval = happyShotsInterval;

    // Boss fetches closest prey's position at constant interval
    setInterval(() => { this.defineTarget(); }, targetAcquirementInterval);
    // Boss shoots rockets at constant interval
    setTimeout(() => { this.shootRockets(); }, this.burstsInterval);
    // Boss gets angry (stronger attacks) as his health lowers
    setInterval(() => {
      this.updateMoodStats();
    }, moodUpdateInterval)
  }

  /**
   * Handle boss's movement and attacks. This function is called as constant interval by the game.
   */
  update() {
    if (this.target !== null) { // Chase target

      /* Update mood */

      /* Movement */

      const targetDistance = distance(this.vehicle.x, this.vehicle.y, this.target.x, this.target.y);

      // Do not go inside the target
      if (this.vehicle.isAccelerating === true) {
        if (targetDistance <= approachDistance) {
          this.game.onMessage(this.id, new Message('keyup', keysValues.arrowUp));
        }
      } else if (targetDistance > approachDistance) {
        this.game.onMessage(this.id, new Message('keydown', keysValues.arrowUp));
      }

      /* Rotation */

      const targetAngle = to360Range(180 + toDegrees(Math.atan2(this.vehicle.y - this.target.y, this.vehicle.x - this.target.x))); // Absolute angle at which the boss musts aim
      const diff = targetAngle - (to360Range(toDegrees(this.vehicle.angle))); // How "far" the target angle is from boss's current angle
      const isTurning = this.vehicle.isTurningLeft === true || this.vehicle.isTurningRight === true;

      if (!isTurning) {
        // Check if rotation is necessary (according to angle diff)
        if (Math.abs(diff) > aimingAccuracy) { // Commence rotation (press keydown)
          // Choose rotation direction (closest)
          if ((diff > 0 && diff < 180) || (diff < -180)) {
            this.pressedRotationKey = keysValues.arrowRight;
          } else {
            this.pressedRotationKey = keysValues.arrowLeft;
          }
          this.game.onMessage(this.id, new Message('keydown', this.pressedRotationKey));
        }
      } else { // Stop turning
        this.game.onMessage(this.id, new Message('keyup', this.pressedRotationKey));
      }
    } // If target is lost, a new one will be automatically acquired within targetAcquirementInterval ms
  }

  /**
   * Search and target the closest player amongst game's vehicles
   */
  defineTarget() {
    let newTarget = null;

    // Check if current target is still valid
    if (this.target !== null && !this.game.has(this.target.id)) {
      this.target = null;
      this.game.onMessage(this.id, new Message('keyup', keysValues.arrowUp)); // Stop moving
    }

    // Search for a target
    for (const v of this.game.vehicles()) {
      if (v.id !== this.id // Don't target self
          && (this.target === null // First target ever -> take it immediately
              || (distance(this.vehicle.x, this.vehicle.y, v.x, v.y) < distance(this.vehicle.x, this.vehicle.y, this.target.x, this.target.y) // Closer target found
                  && v.id !== this.target.id)) // Don't re-target same vehicle
      ) {
        // Found a closer target
        newTarget = v;
      }
    }

    // Update new target
    if (newTarget !== null) {
      this.target = newTarget;
    }
  }

  /**
   * Shoot a burst of rockets if boss currently has a target.
   */
  shootRockets() {
    if(this.target !== null) {
      for(let i = 0; i < this.shotsPerBurst; ++i) {
        setTimeout(() => { this.shootRocket(); }, this.shotsInterval * i);
      }
    }
    setTimeout(() => { this.shootRockets(); }, this.burstsInterval);
  }

  /**
   * Shoot a single rocket.
   */
  shootRocket() {
    this.game.onMessage(this.id, new Message('keydown', keysValues.space));
    this.game.onMessage(this.id, new Message('keyup', keysValues.space));
  }

  /**
   * Changes shooting parameters according to current mood.
   */
  updateMoodStats() {
    this.shotsPerBurst = this.applyMoodRatio(happyShotsPerBurst, angryShotsPerBurst);
    this.burstsInterval = this.applyMoodRatio(happyBurstsInterval, angryBurstsInterval);
    this.shotsInterval = this.applyMoodRatio(happyShotsInterval, angryShotsInterval);
  }

  /**
   * Gives current value between the happy and angry one, according to current health.
   * Full health = happy, no health = angry.
   * @param happyValue
   * @param angryValue
   * @returns {number}
   */
  applyMoodRatio(happyValue, angryValue) {
    return Math.round(happyValue + ((angryValue - happyValue) * (1 - this.vehicle.health / bossMaxHealth)));
  }
}
