import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Reservation } from '../shared/reservation.model';
import { ReservationStorageService } from '../shared/reservation-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit-reservation.component.html',
  styleUrls: ['./edit-reservation.component.css']
})
export class EditComponent implements OnInit {
  editReservationForm: FormGroup;
  subscription: Subscription;
  message: string = null;
  dataSaved: boolean = false;
  reservation: Reservation;
  id: number;
  editMode:boolean = false;

  /*Error messages*/
  errMes = 'This field is required!';
  regexErr = 'You must insert only numbers from 0 to 99!';
  regexDate = 'Date must be of a format yyyy-mm-dd!';

  constructor(
    private router: Router, 
    private reservationStorageService: ReservationStorageService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // Retrieve Id
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
    });
    // Initialize form
    this.initFormToAddOrEdit();
  }

  private initFormToAddOrEdit() {
    if (!this.id) {
      // Initialize form in add mode
      this.initForm();
    } else {
      // Initialize form in edit mode and populate it with values for a particular reservation
      this.initForm();

      this.reservationStorageService.getReservationById(this.id).subscribe(reservation => {
        this.id = reservation.Id;

        // Transform date values so that they don't include time
        const transformedDateFrom = (reservation.DateFrom).toString().substring(0, 10);
        const transformedDateTo = (reservation.DateTo).toString().substring(0, 10);

        // Prepopulate form with values from the database
        this.editReservationForm.controls['firstName'].setValue(reservation.FirstName);  
        this.editReservationForm.controls['lastName'].setValue(reservation.LastName);  
        this.editReservationForm.controls['dateFrom'].setValue(transformedDateFrom);  
        this.editReservationForm.controls['dateTo'].setValue(transformedDateTo); 
        this.editReservationForm.controls['numOfRooms'].setValue(reservation.NumOfRooms);
        this.editReservationForm.controls['numOfPeople'].setValue(reservation.NumOfPeople); 
      })
    }
  };

  onSubmit() {
    const reservation = this.editReservationForm.value;

    // Store person in a database 
    this.createReservation(reservation);
    this.editReservationForm.reset();
    setTimeout(() => this.router.navigate(['search-reservation']), 3000);
  }

  /* Function for adding new user or updating an existing user */
  createReservation(reservation: Reservation) {
    if (!this.id) {
      this.subscription = this.reservationStorageService.storeReservation(reservation).subscribe((reservation) => {
        this.dataSaved = true;
        this.message = "Reservation for " + reservation.FirstName + " " + reservation.LastName + " added successfully !";
      }, error => console.log(error));
    } else {
      reservation.Id = this.id;
      if (confirm('Are you sure you want to change this reservation ?')) {
        this.subscription = this.reservationStorageService.editReservation(reservation).subscribe((reservation) => {
          this.dataSaved = true;
          this.message = "Reservation for " + reservation.FirstName + " " + reservation.LastName + " updated successfully !";
        }), error => console.log(error);
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /* Function for initializing form */
  private initForm() {
    this.editReservationForm = new FormGroup({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      dateFrom: new FormControl(null, [Validators.required,
                                       Validators.pattern(/^[0-9]{4}[-](0[0-9]|1[0-2])[-](0[1-9]|[1-2][0-9]|3[0-1])$/)]),
      dateTo: new FormControl(null, [Validators.required,
                                     Validators.pattern(/^[0-9]{4}[-](0[0-9]|1[0-2])[-](0[1-9]|[1-2][0-9]|3[0-1])$/)]),
      numOfPeople: new FormControl(null, [Validators.required,
                                          Validators.pattern(/^[0-9]{1,2}$/)]),
      numOfRooms: new FormControl(null, [Validators.required, 
                                         Validators.pattern(/^[0-9]{1,2}$/)])
    })
  };
}
