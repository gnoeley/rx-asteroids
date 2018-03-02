const QUADRANT_ANGLE = Math.PI / 2

const calculateOpposite = (angle, hypotenuse) => Math.sin(angle) * hypotenuse
const calculateAdjacent = (angle, hypotenuse) => Math.cos(angle) * hypotenuse

/**
 * Returns the translation from the origin (0, 0) for a point.
 *        +Y   .(1, 1) 
 *         |  / 
 *         |θ/  
 * -X -----+----- +X
 *         | (0, 0)
 *         |
 *        -Y
 * 
 * @param {number} angle Angle of movement in radians 
 * @param {number} speed Speed of movement in units/s
 * @param {number} time Time moving in seconds
 */
export function calculateTranslation(angle, speed, time) {
    const angleForFirstQuadrant = angle % QUADRANT_ANGLE

    const hypotenuse = speed * time
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

export function translateToScreenCoordSpace([x, y]) {
    return [x, -y]
}
