import { Output, Injectable } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { Exercise } from './exercise.model';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService {

    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();
    
    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;
    // private finishedExercises: Exercise[] = [];
    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore,
                private uiService: UIService){}

    fetchAvailableExercises() {
        this.uiService.loadingStateChanged.next(true);
        this.fbSubs.push(this.db.collection('availableExercises')
        .snapshotChanges().pipe(
        map(docArray => {
            // throw new Error();
        return docArray.map(doc => {
            let data = doc.payload.doc.data();
            return {
            id: doc.payload.doc.id,
            name: data['name'],
            calories: data['calories'],
            duration: data['duration']
            };
        });      
        }))
        .subscribe((exercises: Exercise[]) => {
            this.uiService.loadingStateChanged.next(false);
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        }, error => {
            this.uiService.loadingStateChanged.next(false);
            this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
            this.exerciseChanged.next(null);
        }))
    }

    startExercise(selectedId: string) {
        // working with document in firebase
        // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise});
    }

    completeExercise() {state: ''
        this.addDataToDatabase(({...this.runningExercise, date: new Date(), state: 'completed'}));
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase(({...this.runningExercise, 
            date: new Date(), 
            state: 'cancelled', 
            duration: this.runningExercise.duration * (progress / 100), 
            calories: this.runningExercise.calories * (progress / 100)
        }));
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    fetchCompletedOrCancelledExercise() {
        this.fbSubs.push(this.db.collection('finishedExercises').valueChanges().subscribe((exercises: Exercise[]) => {
            // this.finishedExercises = exercises;
            this.finishedExercisesChanged.next(exercises);
        }));
    }

    cancelSubscriptions() {
        this.fbSubs.forEach(sub => sub.unsubscribe())
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}