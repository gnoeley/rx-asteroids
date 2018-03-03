import expect from 'expect'

import * as testSubject from '../app/GeometryFunctions'

describe('GeomeryFunctions', () => {

    describe('#calculateTranslation(angle, distance)', () => {

        const expectToHaveTranslationForAngle = (angle, expectedTranslation) =>
            () => {
                // given
                const distance = 1

                // when
                const actualVelocity = testSubject.calculateTranslation(angle, distance);

                // then
                expect(actualVelocity).toEqual(expectedTranslation)
            }

        it('should only have positive change in the y-axis at 0rad',
            expectToHaveTranslationForAngle(0, [0, 1]))

        it('should have equal positive change in the both-axis at ¼πrad',
            expectToHaveTranslationForAngle(1/4*Math.PI, [0.7071067811865475, 0.7071067811865476]))

        it('should only have positive change in x-axis at ½πrad',
            expectToHaveTranslationForAngle(1/2*Math.PI, [1, 0]))

        it('should have positive change in the x-axis and negative in y-axis at ¾πrad',
            expectToHaveTranslationForAngle(3/4*Math.PI, [0.7071067811865476, -0.7071067811865475]))

        it('should only have negative change in y-axis at πrad',
            expectToHaveTranslationForAngle(Math.PI, [0, -1]))
            
    })

    describe('#translateToScreenCoordSpace(point)', () => {

        it('should negate for positive Y value', () => {
            // given
            const point = [10, 10]

            // when
            const actualPoint = testSubject.translateToScreenCoordSpace(point)

            // then
            expect(actualPoint).toEqual([10, -10])
        })

        it('should negate for negative Y value', () => {
            // given
            const point = [10, -10]

            // when
            const actualPoint = testSubject.translateToScreenCoordSpace(point)

            // then
            expect(actualPoint).toEqual([10, 10])
        })

    })

})