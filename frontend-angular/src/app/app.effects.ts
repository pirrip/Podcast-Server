import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ROUTER_NAVIGATION} from '@ngrx/router-store';
import {map, tap} from 'rxjs/operators';
import {CloseSideNavAction, LOCATION_BACK} from './app.actions';
import {Location} from '@angular/common';

@Injectable()
export class AppEffects {

  @Effect()
  closePanelOnRouteChange$ = this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    map(() => new CloseSideNavAction())
  );

  @Effect({dispatch: false})
  locationBack = this.actions$.pipe(
    ofType(LOCATION_BACK),
    tap(() => this.location.back())
  );

  constructor(private actions$: Actions, private location: Location) {}
}