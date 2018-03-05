import { translate } from './GeometryFunctions'

const toScreenCoord = (canvasHeight, [x, y]) => [x, canvasHeight - y]
const invertY = ([x, y]) => [x, -y]

export const clearCanvas = (canvas) => () => {
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export const drawGeometry = (canvas) => (center, vertices) => {
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