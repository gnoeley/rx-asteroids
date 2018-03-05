import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'
import { map, multicast, refCount, takeWhile, withLatestFrom } from 'rxjs/operators'

import { calculateTranslation, distance, rotateClockwise, translate } from './GeometryFunctions'

const BULLET_VERTICES = [[1, 3], [1, -3], [-1, -3], [-1, 3]]
const BULLET_SPEED = 200

/**
 * Object representing a player bullet; exposing geometry observable.
 * All updates are emited as a result of the given timer observable emitting.
 * The timer's values should be the number of seconds passed since last emission.
 * 
 * The geometry observable emits an array containing both the latest center point
 * and an array of the most recent translated verteces.
 * 
 * The initial center point and angle for the bullet are passed to the constructor.
 */
export default class Bullet {

    constructor(timer, initialCenter, angle) {
        const center = new BehaviorSubject(initialCenter)
        const vertices = Observable.of(rotateClockwise(angle, ...BULLET_VERTICES))

        this.geometry = Observable.combineLatest(center, vertices).pipe(
            multicast(new Subject()),
            refCount()
        )

        timer.pipe(
            withLatestFrom(center),
            map(([time, center]) => translate(center, calculateTranslation(angle, distance(BULLET_SPEED, time)))),
            takeWhile(([pX, pY]) => (pX > 0 && pX < 800) && (pY > 0 && pY < 600))
        ).subscribe(center)
    }

}