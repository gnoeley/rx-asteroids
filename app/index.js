import keyPressed from './KeyPressedSource'
import animationTimer from './AnimationTimer'
import { calculateTranslation } from './GeometryFunctions'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { filter, map, sample, scan, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest } from 'rxjs/operator/combineLatest';

const theCanvas = document.getElementById('the-canvas')

const MIN_SPEED = 0
const MAX_SPEED = 100

const LATERAL_ACCELERATION = 10
const ROTATIONAL_ACCELERATION = Math.PI / 2

const distance = (speed, time) => speed * time

const millisToSeconds = (millis) => millis / 1000

const limit = (value, min, max) => Math.max(Math.min(value, max), min)

const mapVertexRelativeToCenter = ([cX, cY], [vX, vY]) => [cX+vX, cY+vY]

const counterClockwiseRotationMatrix = (angle) => [
    Math.cos(angle),  -Math.sin(angle),
    Math.sin(angle), Math.cos(angle)
]

const rotate = ([x, y], R) => [
        R[0]*x + R[1]*y,
        R[2]*x + R[3]*y
    ]

const rotateAll = (vertices, angle) => {
    const R = counterClockwiseRotationMatrix(angle)
    return vertices.map(vertex => rotate(vertex, R))
}

const point = new BehaviorSubject([400, 300])
const vertices = new BehaviorSubject([[5, 5], [5, -5], [-5, -5], [-5, 5]])

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
            const nextAngle = currentAngle - rotation
            const fullRotation = 2 * Math.PI
            return nextAngle < 0 ? nextAngle + fullRotation : nextAngle % fullRotation 
        }, 0)
    )

// Update Point subject
deltaDistance.pipe(  
        withLatestFrom(angle, point),
        filter(([distance, angle, point]) => distance),
        map(([distance, angle, point]) => {
            const [tX, tY] = calculateTranslation(angle, distance)
            const [pX, pY] = point
            return [pX+tX, pY+tY]
        })
    )
    .subscribe(point)

// Update vertices subject
deltaAngle.pipe(
        withLatestFrom(vertices),
        map(([deltaAngle, vertices]) => rotateAll(vertices, deltaAngle))
    )
    .subscribe(vertices)

// Draw!
Observable.combineLatest(point, vertices).pipe(
        tap(() => {
            const ctx = theCanvas.getContext("2d")
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, 800, 600)
        })
    ).subscribe(([point, vertices]) => {
        const ctx = theCanvas.getContext("2d")
        ctx.strokeStyle = '#eee'
        ctx.fillStyle = '#000'
        ctx.lineWidth = 2

        const relativeVertices = vertices.map((vertex) => mapVertexRelativeToCenter(point, vertex))
        const firstVertex = relativeVertices.shift()
        relativeVertices.push(firstVertex)

        ctx.beginPath()
        ctx.moveTo(firstVertex[0], firstVertex[1])
        relativeVertices.forEach(([x, y]) => ctx.lineTo(x, y))
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    })
