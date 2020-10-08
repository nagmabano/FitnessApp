import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Router, Route } from '@angular/router';
import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

// import { AuthService } from './auth.service';
import * as fromRoot from '../app.reducer';
import { take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

    constructor(private store: Store<fromRoot.State>,
                // private authService: AuthService,
                private router: Router){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if(this.authService.isAuth()) {
        //     return true;
        // } else {
        //     this.router.navigate(['/login']);
        // }   
        return this.store.select(fromRoot.getIsAuthenticated).pipe(take(1));
    }

    canLoad(route: Route) {
        // if(this.authService.isAuth()) {
        //     return true;
        // } else {
        //     this.router.navigate(['/login']);
        // }   
        return this.store.select(fromRoot.getIsAuthenticated).pipe(take(1));
    }
    
}