import { translate } from './GeometryFunctions'
import { Subject } from 'rxjs/Subject'
import { map, tap, withLatestFrom } from 'rxjs/operators'

const drawSubject = new Subject()

const toScreenCoord = (canvasHeight, [x, y]) => [x, canvasHeight - y]
const invertY = ([x, y]) => [x, -y]

const clearCanvas = (canvas) => () => {
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

const drawGeometry = (canvas) => ([center, vertices]) => {
    const ctx = canvas.getContext("2d")
    ctx.strokeStyle = '#eee'
    ctx.fillStyle = '#000'
    ctx.lineWidth = 2

    const centerTranslatedForCanvas = toScreenCoord(canvas.height, center)
    const relativeVertices = vertices.map((vertex) => 
            translate(centerTranslatedForCanvas, invertY(vertex)))
    const firstVertex = relativeVertices.shift()
    relativeVertices.push(firstVertex)

    ctx.beginPath()
    ctx.moveTo(firstVertex[0], firstVertex[1])
    relativeVertices.forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
}

export function drawGeometryObservable(canvas) {
    const drawFn = drawGeometry(canvas)
    const clearFn = clearCanvas(canvas)

    return function(geometryObs) {
        const drawSubscription = drawSubject.pipe(
            withLatestFrom(geometryObs),
            map(([_, geometry]) => geometry)
        ).subscribe(drawFn)

        geometryObs.pipe(
            tap(clearFn)
        ).subscribe({
            next: () => drawSubject.next(), 
            complete: () => drawSubscription.unsubscribe()
        })
    }
}