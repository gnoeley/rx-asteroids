import expect from 'expect'

import * as testSubject from '../app/GeometryFunctions'

describe('GeomeryFunctions', () => {

    describe('#calculateTranslation(angle, speed, time)', () => {

        const expectToHaveVelocityForAngle = (angle, expectedVelocity) =>
            () => {
                // given
                const speed = 1
                const time = 1

                // when
                const actualVelocity = testSubject.calculateTranslation(angle, speed, time);

                // then
                expect(actualVelocity).toEqual(expectedVelocity)
            }

        it('should only have positive change in the y-axis at 0rad',
            expectToHaveVelocityForAngle(0, [0, 1]))

        it('should have equal positive change in the both-axis at ¼πrad',
            expectToHaveVelocityForAngle(1/4*Math.PI, [0.7071067811865475, 0.7071067811865476]))

        it('should only have positive change in x-axis at ½πrad',
            expectToHaveVelocityForAngle(1/2*Math.PI, [1, 0]))

        it('should have positive change in the x-axis and negative in y-axis at ¾πrad',
            expectToHaveVelocityForAngle(3/4*Math.PI, [0.7071067811865476, -0.7071067811865475]))

        it('should only have negative change in y-axis at πrad',
            expectToHaveVelocityForAngle(Math.PI, [0, -1]))

        it('should apply speed based on time passed', () => {
            // given
            const expectedVelocity = [0, 2]
            const angle = 0
            const speed = 1
            const time = 2

            // when
            const actualVelocity = testSubject.calculateTranslation(angle, speed, time)

            // then
            expect(actualVelocity).toEqual(expectedVelocity)
        })

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