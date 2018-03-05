import keyPressed from './KeyPressedSource'
import animationTimer from './AnimationTimer'
import { clearCanvas, drawGeometry } from './Draw'
import { calculateTranslation, translate, rotateClockwise } from './GeometryFunctions'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { filter, map, scan, startWith, switchMapTo, takeWhile, tap, withLatestFrom, finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs/operator/combineLatest';

const theCanvas = document.getElementById('the-canvas')

const FULL_ROTATION = 2 * Math.PI

const MIN_SPEED = 0 // px/s
const MAX_SPEED = 100 // px/s

const LATERAL_ACCELERATION = 10 // px/s/s
const ROTATIONAL_ACCELERATION = Math.PI / 2 // rad/s

const distance = (speed, time) => speed * time

const millisToSeconds = (millis) => millis / 1000

const limit = (value, min, max) => Math.max(Math.min(value, max), min)

// Draw!
const drawSubject = new Subject()

const draw = (geom) => {
    const drawSubscription = drawSubject.pipe(
        withLatestFrom(geom),
        map(([_, geom]) => geom)
    ).subscribe(([point, vertices]) => drawGeometry(theCanvas)(point, vertices))

    geom.pipe(
        tap(clearCanvas(theCanvas))
    ).subscribe({
        next: () => drawSubject.next(), 
        complete: () => drawSubscription.unsubscribe()
    })
}

/*
    PLAYER !!!
*/
const point = new BehaviorSubject([400, 300])
const vertices = new BehaviorSubject([[5, 5], [5, -5], [-5, -5], [-5, 5]])

const playerGeom = Observable.combineLatest(point, vertices)
    .multicast(new Subject())
    .refCount()

const timer = animationTimer()
    .pipe( map(millisToSeconds) )
    .share()

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
const angle = deltaAngle.pipe(
        scan((currentAngle, rotation) => {
            const nextAngle = currentAngle + rotation
            return nextAngle < 0 ? nextAngle + FULL_ROTATION : nextAngle % FULL_ROTATION 
        }, 0),
        startWith(0)
    )

// Update Point subject
deltaDistance.pipe(
        withLatestFrom(angle, point),
        filter(([distance, angle, point]) => distance),
        map(([distance, angle, point]) => translate(point, calculateTranslation(angle, distance)))
    )
    .subscribe(point)

// Update vertices subject
deltaAngle.pipe(
        withLatestFrom(vertices),
        map(([deltaAngle, vertices]) => rotateClockwise(deltaAngle, ...vertices))
    )
    .subscribe(vertices)

draw(playerGeom)

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

    draw(bulletGeom)
}

keyPressed('l')
    .pipe(
        filter(isPressed => isPressed),
        withLatestFrom(point, angle)
    )
    .subscribe(([_, point, angle]) => shoot(point, angle))
