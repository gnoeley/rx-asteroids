import { marbles } from 'rxjs-marbles'
import expect, { spyOn, restoreSpies } from 'expect'

import { Observable } from 'rxjs'
import testSubject from '../app/KeyPressedSource'

const aKeyEvent = (key) => ({ key })

const emittedValues = { a: true, b: false }

const keyEventvalues = { a: aKeyEvent('w'), b: aKeyEvent('a'), c: aKeyEvent('d') }

describe('KeyPressedSource', () => {

    let existingDocument

    let keyDownEvents

    let keyUpEvents

    beforeEach(() => {
        keyDownEvents = Observable.empty()
        keyUpEvents = Observable.empty()

        spyOn(Observable, 'fromEvent').andCall((target, eventType) => eventType === 'keydown' ? keyDownEvents : keyUpEvents)

        existingDocument = global.document
        global.document = { key: 'fake event target' }
    })

    afterEach(() => {
        restoreSpies()
        global.document = existingDocument
    })


    it('should subscribe expected event observable', () => {
        // given
        keyDownEvents = Observable.empty()
        keyUpEvents = Observable.empty()
        const fromEventSpy = Observable.fromEvent

        // when
       testSubject('w')

        // then
        expect(fromEventSpy).toHaveBeenCalledWith(global.document, 'keydown')
        expect(fromEventSpy).toHaveBeenCalledWith(global.document, 'keyup')
    })

    it('should start with expected value', marbles(m => {
        // given
        keyUpEvents = m.hot(                '-')
        const expectedObservable = m.cold(  'b', emittedValues)

        // when
        const actualObservable = testSubject('w')

        // then
        m.expect(actualObservable).toBeObservable(expectedObservable)
    }))

    it('should only emit values for given key down', marbles(m => {
        // given
        keyDownEvents = m.hot(              '-b-b-c-a-c', keyEventvalues)
        const expectedObservable = m.cold(  'b------a--', emittedValues)

        // when
        const actualObservable = testSubject('w')

        // then
        m.expect(actualObservable).toBeObservable(expectedObservable)
    }))

    it('should only emit values for given key up', marbles(m => {
        // given
        keyDownEvents = m.hot(              '-a--------', keyEventvalues)
        keyUpEvents = m.hot(                '-b-b-c-a-c', keyEventvalues)
        const expectedObservable = m.cold(  'ba-----b--', emittedValues)

        // when
        const actualObservable = testSubject('w')

        // then
        m.expect(actualObservable).toBeObservable(expectedObservable)
    }))

    it('should only emit when up/down state changes', marbles(m => {
        // given
        const keyEventvalues = { a: aKeyEvent('w') }
        keyDownEvents = m.hot(              '-a-a-a-----a-a-a--', keyEventvalues)
        keyUpEvents = m.hot(                '------a---------a-', keyEventvalues)
        const expectedObservable = m.cold(  'ba----b----a----b-', emittedValues)

        // when
        const actualObservable = testSubject('w')

        // then
        m.expect(actualObservable).toBeObservable(expectedObservable)
    }))

})
