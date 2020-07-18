import { Output, Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { Exercise } from './exercise.model';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';

@Injectable()
export class TrainingService {

    @Output() exerciseChanged = new Subject<Exercise>();
    @Output() exercisesChanged = new Subject<Exercise[]>();
    
    private availableExercises: Exercise[] = [];

    private runningExercise: Exercise;
    private exercises: Exercise[] = [];

    constructor(private db: AngularFirestore){}

    fetchAvailableExercises() {
        this.db.collection('availableExercises')
        .snapshotChanges().pipe(
        map(docArray => {
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
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        })
    }

    startExercise(selectedId: string) {
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

    getCompletedOrCancelledExercise() {
        return this.exercises.slice();
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}