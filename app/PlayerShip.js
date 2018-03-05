import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'
import { filter, map, multicast, refCount, scan, withLatestFrom } from 'rxjs/operators';

import { calculateTranslation, distance, rotateClockwise, translate } from './GeometryFunctions'
import keyPressed from './KeyPressedSource'

const FULL_ROTATION = 2 * Math.PI

const MIN_SPEED = 0 // px/s
const MAX_SPEED = 100 // px/s

const LATERAL_ACCELERATION = 10 // px/s/s
const ROTATIONAL_ACCELERATION = Math.PI / 2 // rad/s

const INITIAL_CENTER_POINT = [400, 300]
const PLAYER_SHIP_VERTICES = [[5, 5], [5, -5], [-5, -5], [-5, 5]]

const limit = (value, min, max) => Math.max(Math.min(value, max), min)

/** 
 * Object repesenting the player's ship; exposing geometry and angle observables.
 * All updates are emited as a result of the given timer observable emitting.
 * The timer's values should be the number of seconds passed since last emission.
 * 
 * The geometry observable emits an array containing both the latest center point
 * and an array of the most recent translated verteces.
 * 
 * The angle observable emits the latest total rotation (trajectory).
*/
export default class PlayerShip {

    constructor(timer) {
        const center = new BehaviorSubject(INITIAL_CENTER_POINT)
        const vertices = new BehaviorSubject(PLAYER_SHIP_VERTICES)
        this.geometry = Observable.combineLatest(center, vertices).pipe(
            multicast(new Subject()),
            refCount()
        )

        // The change in distance on each time emit
        const deltaDistance = timer.pipe(
            withLatestFrom(keyPressed('w')),
            map(([time, isDown]) => [time, distance(LATERAL_ACCELERATION, time) * (isDown ? 1 : -1)]),
            scan(([_, totalSpeed], [time, delta]) => [time, limit(totalSpeed + delta, MIN_SPEED, MAX_SPEED)], [0, 0]),
            map(([time, totalSpeed]) => distance(totalSpeed, time))
        )

        // The change in angle on each timer emit
        const deltaAngle = timer.pipe(
            withLatestFrom(keyPressed('a'), keyPressed('d')),
            filter(([time, isLeft, isRight]) => time && (isLeft !== isRight)),
            map(([time, isLeft, isRight]) => ROTATIONAL_ACCELERATION * time * (isLeft ? -1 : 1))
        )

        // Keep track of our total rotation
        this.angle = deltaAngle.pipe(
            scan((currentAngle, rotation) => {
                const nextAngle = currentAngle + rotation
                return nextAngle < 0 ? nextAngle + FULL_ROTATION : nextAngle % FULL_ROTATION 
            }, 0)
        )

        // Update center point subject
        deltaDistance.pipe(
            withLatestFrom(this.angle, center),
            filter(([distance, angle, center]) => distance),
            map(([distance, angle, center]) => translate(center, calculateTranslation(angle, distance)))
        )
        .subscribe(center)

        // Update vertices subject
        deltaAngle.pipe(
            withLatestFrom(vertices),
            map(([deltaAngle, vertices]) => rotateClockwise(deltaAngle, ...vertices))
        )
        .subscribe(vertices)

    }

}
