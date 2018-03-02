import { Observable } from "rxjs/Observable"
import { filter, mapTo } from 'rxjs/operators'

const isForKey = (key) => 
    (source) => 
        source.pipe(
            filter(({key: eventKey}) => eventKey === key)
        )

const ofKeyDown = (key) => 
    Observable.fromEvent(document, 'keydown')
        .pipe(
            isForKey(key),
            mapTo(true)
        )

const ofKeyUp = (key) => 
    Observable.fromEvent(document, 'keyup')
        .pipe(
            isForKey(key),
            mapTo(false)
        )

export default (key) => 
    Observable.merge(
        ofKeyDown(key), 
        ofKeyUp(key)
    )
    .startWith(false)
    .distinctUntilChanged()