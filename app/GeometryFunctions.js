const QUADRANT_ANGLE = Math.PI / 2

const calculateOpposite = (angle, hypotenuse) => Math.sin(angle) * hypotenuse
const calculateAdjacent = (angle, hypotenuse) => Math.cos(angle) * hypotenuse


const counterClockwiseRotationMatrix = (angle) => [
    Math.cos(angle),  -Math.sin(angle),
    Math.sin(angle), Math.cos(angle)
]

const multiplyMatrix = ([x, y], R) => [
        R[0]*x + R[1]*y,
        R[2]*x + R[3]*y
    ]

/**
 * Returns the translation from the origin (0, 0) for a point.
 * 
 * EXAMPLE:
 * Given an angle θ=0.644rad and a distance d=5 the translation is calculated as follows
 * 
 * x = sin(0.644) * 5 = ≈3
 * y = cos(0.644) * 5 = ≈4
 * 
 *        +Y   .(3, 4) 
 *         |  / 
 *         |θ/  
 * -X -----+----- +X
 *         | (0, 0)
 *         |
 *        -Y
 * 
 * To allow for the calculation across all four quadrants, the provided angle is bound
 * to the first quadrant using modulo division. The opposite and adjacent sides are then
 * swapped as required and the values are negated to maintain the correct direction.
 * 
 * @param {number} angle Angle of movement in radians 
 * @param {number} distance Distance travelled in arbritray units
 */
export function calculateTranslation(angle, distance) {
    const angleForFirstQuadrant = angle % QUADRANT_ANGLE

    const hypotenuse = distance
    const opposite = calculateOpposite(angleForFirstQuadrant, hypotenuse)
    const adjacent = calculateAdjacent(angleForFirstQuadrant, hypotenuse)

    const quadrant = Math.floor(angle / QUADRANT_ANGLE)
    const swapSides = (quadrant % 2) === 1

    const directionInX = quadrant === 0 || quadrant === 1 ? 1 : -1
    const directionInY = quadrant === 3 || quadrant === 0 ? 1 : -1

    const distanceInX = (swapSides ? adjacent : opposite) * directionInX
    const distanceInY = (swapSides ? opposite : adjacent) * directionInY

    return [distanceInX, distanceInY]
}

export function translate([pX, pY], [tX, tY]) {
    return [pX+tX, pY+tY]
}

export function rotateClockwise(angle, ...vertices) {
    const R = counterClockwiseRotationMatrix(-angle)
    return vertices.map(vertex => multiplyMatrix(vertex, R))
}

export function distance(speed, time) {
    return speed * time
}