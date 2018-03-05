import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { filter, map, takeWhile, withLatestFrom } from 'rxjs/operators';

import keyPressed from './KeyPressedSource'
import animationTimer from './AnimationTimer'
import { drawGeometryObservable as draw } from './Draw'
import { calculateTranslation, distance, translate, rotateClockwise } from './GeometryFunctions'
import PlayerShip from './PlayerShip'

const theCanvas = document.getElementById('the-canvas')
const drawToCanvas = draw(theCanvas)

const millisToSeconds = (millis) => millis / 1000

const timer = animationTimer()
    .pipe( map(millisToSeconds) )
    .share()

const playerShip = new PlayerShip(timer)
drawToCanvas(playerShip.geometry)

/*
    BULLETS!!!
*/
const BULLET_VERTICES = [[1, 3], [1, -3], [-1, -3], [-1, 3]]
const BULLET_SPEED = 200

const shoot = (center, angle) => {
    const point = new BehaviorSubject(center)
    const vertices = Observable.of(rotateClockwise(angle, ...BULLET_VERTICES))

    const bulletGeom = Observable.combineLatest(point, vertices)
        .multicast(new Subject())
        .refCount()

    timer.pipe(
        withLatestFrom(point),
        map(([time, point]) => translate(point, calculateTranslation(angle, distance(BULLET_SPEED, time)))),
        takeWhile(([pX, pY]) => (pX > 0 && pX < 800) && (pY > 0 && pY < 600))
    ).subscribe(point)

    drawToCanvas(bulletGeom)
}

keyPressed('l')
    .pipe(
        filter(isPressed => isPressed),
        withLatestFrom(playerShip.geometry, playerShip.angle)
    )
    .subscribe(([_, [point], angle]) => shoot(point, angle))
