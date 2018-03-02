import {Observable} from "rxjs/Observable";
import { Scheduler } from "rxjs/Rx";
import { map, pairwise, pluck, share, timestamp } from "rxjs/operators";

export default (scheduler = Scheduler.animationFrame) =>
    Observable.interval(0, scheduler)
        .pipe(
            timestamp(scheduler),
            pluck('timestamp'),
            pairwise(),
            map(([last, now]) => now - last)
        )