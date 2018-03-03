import keyPressed from './KeyPressedSource'
import animationTimer from './AnimationTimer'
import { calculateTranslation } from './GeometryFunctions'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { filter, map, sample, scan, tap, withLatestFrom } from 'rxjs/operators';

const theCanvas = document.getElementById('the-canvas')

const VERTICES = [
    [5, 5], [5, -5], [-5, -5], [-5, 5]
]

const MIN_SPEED = 0
const MAX_SPEED = 20

const LATERAL_ACCELERATION = 2
const ROTATIONAL_ACCELERATION = Math.PI / 2

const distance = (speed, time) => speed * time

const millisToSeconds = (millis) => millis / 1000

const limit = (value, min, max) => Math.max(Math.min(value, max), min)

const point = new BehaviorSubject([400, 300])
// point
//     .pipe( sample(Observable.interval(500)) )
//     .subscribe((val) => console.log(val))

const timer = animationTimer()
    .pipe( map(millisToSeconds) )
    .share()

const speed = timer.pipe(
        withLatestFrom(keyPressed('w')),
        map(([time, isDown]) => distance(LATERAL_ACCELERATION, time) * (isDown ? 1 : -1)),
        scan((speed, delta) => limit(speed + delta, MIN_SPEED, MAX_SPEED), 0)
    )

const angle = timer.pipe(
    withLatestFrom(keyPressed('a'), keyPressed('d')),
    filter(([time, isLeft, isRight]) => time && (isLeft !== isRight)),
    map(([time, isLeft, isRight]) => ROTATIONAL_ACCELERATION * time * (isLeft ? -1 : 1)),
    scan((currentAngle, rotation) => {
        const nextAngle = currentAngle + rotation
        const fullRotation = 2 * Math.PI
        return nextAngle < 0 ? nextAngle + fullRotation : nextAngle % fullRotation 
    }, 0),
)

timer.pipe(
        withLatestFrom(speed, angle, point),
        filter(([time, speed, angle, point]) => time && speed),
        map(([time, speed, angle, point]) => {
            const distance = speed * time
            const [tX, tY] = calculateTranslation(angle, distance)
            const [pX, pY] = point
            return [pX+tX, pY+tY]
        })
    )
    .subscribe(point)

timer.pipe(
        withLatestFrom(point),
        tap(() => {
            const ctx = theCanvas.getContext("2d")
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, 800, 600)
        }),
        map(([_, point]) => point)
    ).subscribe((point) => {
        const ctx = theCanvas.getContext("2d")
        ctx.strokeStyle = '#eee'
        ctx.fillStyle = '#000'
        ctx.lineWidth = 2

        const relativeVertices = VERTICES.map((vertex) => mapVertexRelativeToCenter(point, vertex))
        const firstVertex = relativeVertices.shift()
        relativeVertices.push(firstVertex)

        ctx.beginPath()
        ctx.moveTo(firstVertex[0], firstVertex[1])
        relativeVertices.forEach(([x, y]) => ctx.lineTo(x, y))
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    })

const mapVertexRelativeToCenter = ([cX, cY], [vX, vY]) => [cX+vX, cY+vY]