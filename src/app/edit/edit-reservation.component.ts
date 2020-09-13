import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Reservation } from '../shared/reservation.inteface';
import { ReservationStorageService } from '../shared/reservation-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit-reservation.component.html',
  styleUrls: ['./edit-reservation.component.css']
})

export class EditComponent implements OnInit, OnDestroy {
  editReservationForm: FormGroup;
  subscription: Subscription;
  message: string = null;
  dataSaved: boolean = false;
  reservation: Reservation;
  id: number;
  editMode:boolean = false;
  error = null;
  private Timer: any;

  /* Error messages */
  errMes = 'This field is required!';
  regexErr = 'The number of people must be 1-4!';
  regexDate = 'Date must be of a format yyyy-mm-dd!';
  dateFromHigherThanDateTo = "Date To must be higher than or equal to Date From!";
  minDate = `Date must be higher than or equal to today's date: ${new Date().toJSON().split(/[T:.Z]/).join(' ').substring(0, 10)}`;
  numOfPeopleinSingleRoomMes = 'Maximum number of people allowed in single room is 1';
  numOfPeopleinDoubleRoomMes = 'Maximum number of people allowed in double room is 2';
  numOfPeopleinDoubleRoomwithBalconyMes = 'Maximum number of people allowed in double room with balcony is 2';
  
  constructor(
    private router: Router, 
    private reservationStorageService: ReservationStorageService,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    // Retrieve Id from Url
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
      
      this.subscription = this.reservationStorageService.getReservationById(this.id).subscribe(reservation => {
        this.id = reservation.Id;
        
        // Transform date values so that they don't include time
        const transformedDateFrom = (reservation.DateFrom).toString().substring(0, 10);
        const transformedDateTo = (reservation.DateTo).toString().substring(0, 10);
        
        // Prepopulate form with values from the database
        (<FormControl>this.editReservationForm.controls['firstName']).setValue(reservation.FirstName); 
        (<FormControl>this.editReservationForm.controls['lastName']).setValue(reservation.LastName);     
        (<FormControl>this.editReservationForm.get('dates.dateFrom')).setValue(transformedDateFrom);  
        (<FormControl>this.editReservationForm.get('dates.dateTo')).setValue(transformedDateTo);  
        (<FormControl>this.editReservationForm.get('rooms.numOfPeople')).setValue(reservation.NumOfPeople); 
        (<FormControl>this.editReservationForm.get('rooms.roomType')).setValue(reservation.RoomType);  
      })
    }
  };

  onSubmit() {
    const firstName = this.editReservationForm.value.firstName;
    const lastName = this.editReservationForm.value.lastName;
    const dateFrom = (this.editReservationForm.controls['dates'].value).dateFrom;
    const dateTo = (this.editReservationForm.controls['dates'].value).dateTo;
    const roomType = (this.editReservationForm.controls['rooms'].value).roomType;
    const numOfPeople = (this.editReservationForm.controls['rooms'].value).numOfPeople;
    
    // Store person in a database 
    if (this.id) {
      this.createReservation({ Id: this.id, FirstName : firstName, LastName : lastName, DateFrom : dateFrom, DateTo : dateTo, RoomType : roomType, NumOfPeople : numOfPeople });
    } else {
      this.createReservation({ FirstName : firstName, LastName : lastName, DateFrom : dateFrom, DateTo : dateTo, RoomType : roomType, NumOfPeople : numOfPeople });
    } 
  }

  /* Function for adding new user or updating an existing user */
  createReservation(reservation: Reservation) {
    if (!this.id) {
      this.subscription = this.reservationStorageService.storeReservation(reservation).subscribe((reservation) => {
        this.dataSaved = true;
        this.message = "Reservation for " + reservation.FirstName + " " + reservation.LastName + " added successfully !";
        this.editReservationForm.reset(); 
        this.Timer = setTimeout(() => this.router.navigate(['search-reservation']), 3000);
      }, err => {
        this.error = err;
        if (err.status === 422) {
          this.message = err.error.message;
        } else if (err.status === 400) {
          this.message = `The request you sent to the server is not valid`;
        } else {
          this.message = `Some error occured: ${err.message}`;
        }
        console.log(err) 
        this.Timer = setTimeout(() => this.error = null, 10000); }
    )} else {
      if (confirm('Are you sure you want to change this reservation ?')) { 
        reservation.Id = this.id;
        
        this.subscription = this.reservationStorageService.editReservation(reservation).subscribe((reservation) => {
            this.dataSaved = true;
            this.message = "Reservation for " + reservation.FirstName + " " + reservation.LastName + " updated successfully !"; 
            this.editReservationForm.reset(); 
            this.Timer = setTimeout(() => this.router.navigate(['search-reservation']), 3000);
          }, err => {
            this.error = err;
            if (err.status === 422) {
              this.message = err.error.message;
            } else if (err.status === 400) {
              this.message = `The request you sent to the server is not valid`;
            } else if (err.status === 404) {
              this.message = `Reservation with id = ${reservation.Id} NOT FOUND`;
            } else {
              this.message = `Some error occured: ${err.message}`;
            }
            console.log(err) 
            this.Timer = setTimeout(() => this.error = null, 10000); }
      )};
    }
  }

  onHandleResponse() {
    this.error = null;
    clearTimeout(this.Timer);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /* Function for initializing the form */
  private initForm() {
    this.editReservationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dates: this.fb.group({
        dateFrom: ['', [Validators.required, 
                        Validators.pattern(/^[0-9]{4}[-](0[0-9]|1[0-2])[-](0[1-9]|[1-2][0-9]|3[0-1])$/), 
                        this.validateDate]],
        dateTo: ['', [Validators.required, 
                      Validators.pattern(/^[0-9]{4}[-](0[0-9]|1[0-2])[-](0[1-9]|[1-2][0-9]|3[0-1])$/), 
                      this.validateDate]],
      }, { validator : this.compareDates }),
      rooms: this.fb.group({
        numOfPeople: ['', [Validators.required,
                           Validators.pattern(/^[1-4]$/)]],
        roomType: ['Double room']
      }, { validator : this.numOfPeopleinRoom })
    });
  }

  /* Function for comparing dates */
  private compareDates(fb: FormGroup) {
    let dateFromCtrl = fb.get('dateFrom');
    let dateToCtrl = fb.get('dateTo');

    if (dateToCtrl.errors == null || 'dateFromHigherThanDateTo' in dateToCtrl.errors) {
      if (dateFromCtrl.value > dateToCtrl.value) {
        dateToCtrl.setErrors({ dateFromHigherThanDateTo: true })
      } else {
        dateToCtrl.setErrors(null);
      } 
    }
  };

  /* Function for testing the number of people allowed in a particular room type */
  private numOfPeopleinRoom(fb: FormGroup) {
    let numOfPeopleCtrl = fb.get('numOfPeople');
    let roomTypeCtrl = fb.get('roomType');

    if (numOfPeopleCtrl.errors == null && roomTypeCtrl.value == 'Single room' && numOfPeopleCtrl.value > 1) {        
      roomTypeCtrl.setErrors({ numOfPeopleinSingleRoom : true });
    } else if (numOfPeopleCtrl.errors == null && roomTypeCtrl.value == 'Double room' && numOfPeopleCtrl.value > 2) {
      roomTypeCtrl.setErrors({ numOfPeopleinDoubleRoom : true });
    } else if (numOfPeopleCtrl.errors == null && roomTypeCtrl.value == 'Double room with balcony' && numOfPeopleCtrl.value > 2) {
      roomTypeCtrl.setErrors({ numOfPeopleinDoubleRoomwithBalcony : true });
    } else {
      roomTypeCtrl.setErrors(null);
    }
  }
  
  /* Function for comparing Date From and Date To to Today's Date */
  private validateDate(control: FormControl): { [key: string]: any } | null {
      if (Date.parse(control.value) < Date.parse(new Date().toJSON().split(/[T:.Z]/).join(' ').substring(0, 10))) {
        return { 'higherThanToday': true }
      }
      return null;
  }
}
