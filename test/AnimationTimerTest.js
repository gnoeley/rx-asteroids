import expect, { spyOn } from 'expect'
import { marbles } from 'rxjs-marbles'
import { Observable } from 'rxjs'

import testSubject from '../app/AnimationTimer'

describe('AnimationTimer', () => {
    
    it('should emit expected values', marbles((m) => {
        // given
        const source = m.hot(               '-0-1---2--3-')
        spyOn(Observable, 'interval').andReturn(source)
        const expectedObservable = m.cold(  '---a---b--c-', { a: 20, b: 40, c: 30 });

        // when
        const actualObservable = testSubject(m.scheduler);

        // then
        m.expect(actualObservable).toBeObservable(expectedObservable)
    }))
    
})