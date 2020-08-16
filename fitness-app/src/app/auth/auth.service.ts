import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth} from 'angularfire2/auth';
import { Subject } from 'rxjs'; 

import { User } from './user.model';
import { AuthData } from './auth-data.model';
import { TrainingService } from '../training/training.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UIService } from '../shared/ui.service';

@Injectable()
export class AuthService {
    authChange = new Subject<boolean>();
    private isAuthenticated = false;

    constructor(private router: Router,
                private afAuth: AngularFireAuth,
                private trainingService: TrainingService,
                private uiService: UIService) {}

    initAuthListener() {
        this.afAuth.authState.subscribe(user => {
            if(user){
                this.isAuthenticated = true;
                this.authChange.next(true);
                this.router.navigate(['/training']); 
            } else {
                this.trainingService.cancelSubscriptions();
                this.isAuthenticated = false;
                this.authChange.next(false);
                this.router.navigate(['/login']);
        
            }
        })
    }

    registerUser(authData: AuthData) {
        this.uiService.loadingStateChanged.next(true);
        this.afAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password).then(result => {
            console.log(result); 
            this.uiService.loadingStateChanged.next(false);          
        }).catch(error => {
            console.error();
            console.log(error); 
            this.uiService.loadingStateChanged.next(false);
            this.uiService.showSnackbar(error.message, null, 3000);        
        }); 
    }

    login(authData: AuthData ) {
        this.uiService.loadingStateChanged.next(true);
        this.afAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
        .then(result => {
            this.uiService.loadingStateChanged.next(false);
            console.log(result);         
        }).catch(error => {
            console.error();
            console.log(error); 
            this.uiService.loadingStateChanged.next(false);  
            this.uiService.showSnackbar(error.message, null, 3000);      
        }); 
    }

    logout() {
        this.afAuth.auth.signOut();
    }

    getUser() {
        
    }

    isAuth() {
        return this.isAuthenticated;
    }


}