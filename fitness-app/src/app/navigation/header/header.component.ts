import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';

import { AuthService } from 'src/app/auth/auth.service';

import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() sidenavToggle = new EventEmitter<void>();
  // isAuth = false ;
  isAuth$: Observable<boolean>;
  authSubscription: Subscription

  constructor(private store: Store<fromRoot.State>, 
              private authService: AuthService
              ) { }

  ngOnInit(): void {
    // this.authSubscription = this.authService.authChange.subscribe(authStatus => {
    //   this.isAuth = authStatus;
    // });
    this.isAuth$ = this.store.select(fromRoot.getIsAuthenticated)
  }

  onToggleSidenav() {
    this.sidenavToggle.emit();
  }

  onLogout() {
    this.authService.logout();
  }

  // ngOnDestroy() {
  //   this.authSubscription.unsubscribe();
  // }

}
