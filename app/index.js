import { Observable } from 'rxjs/Observable'
import { filter, map, withLatestFrom } from 'rxjs/operators';

import keyPressed from './KeyPressedSource'
import animationTimer from './AnimationTimer'
import { drawGeometryObservable as draw } from './Draw'
import Bullet from './Bullet'
import PlayerShip from './PlayerShip'

const theCanvas = document.getElementById('the-canvas')
const drawToCanvas = draw(theCanvas)

const millisToSeconds = (millis) => millis / 1000

const timer = animationTimer()
    .pipe( map(millisToSeconds) )
    .share()

// Create player
const playerShip = new PlayerShip(timer)
drawToCanvas(playerShip.geometry)

// Create bullets on keyPressed
keyPressed('l')
    .pipe(
        filter(isPressed => isPressed),
        withLatestFrom(playerShip.geometry, playerShip.angle),
        map(([_, [point], angle]) => new Bullet(timer, point, angle))
    )
    .subscribe((bullet) => drawToCanvas(bullet.geometry))
