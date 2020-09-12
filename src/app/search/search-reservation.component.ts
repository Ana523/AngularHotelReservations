import { Component, OnInit, OnDestroy } from '@angular/core';
import { Reservation } from '../shared/reservation.inteface';
import { ReservationStorageService } from '../shared/reservation-storage.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search-reservation.component.html',
  styleUrls: ['./search-reservation.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  reservation: Reservation;
  reservations: Reservation[];
  subscription: Subscription;
  p: number = 1;
  id: number;
  firstName: string;
  lastName: string;
  isLoading: boolean;
 
  // Variables to be used as query params
  dateFrom: Date;
  dateTo: Date;
  numOfPeople: number;
  roomType: string;

  // Notify user about data changes (deletion or edition)
  dataSaved: boolean = false;
  message: string = null;

  // Notify user if there has been some error
  errMessage: string = null;
  error = null;

  // Properties defined for filter pipe
  filteredFirstName: string = '';
  filteredLastName: string = '';
  filteredDateFrom: string = '';
  filteredDateTo: string = '';
  filteredRoomType: string = '';
  
  constructor(private reservationStorageService: ReservationStorageService, 
              private router: Router) {

  }

  ngOnInit() {
    this.loadAllReservations();
  }

  loadAllReservations() {
    this.isLoading = true;
    this.subscription = this.reservationStorageService.getReservationsFromDb().subscribe(reservations => { 
      this.isLoading = false;
      this.reservations = reservations; 
    }
    , err => {
      this.isLoading = false;
      this.error = err;
      this.errMessage = `Some error occured: ${err.message}`;
      console.log(err) }
  )};

  onLoadReservation(id: number, dateFrom: Date, dateTo: Date, numOfPeople: number, roomType: string) {
    // Store id and other info about a reservation
    this.id = id;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.numOfPeople = numOfPeople;
    this.roomType = roomType;

    // Transform dates to conform to the desired date format
    let dateFromTransformed = this.dateFrom.toString().substring(0, 10);
    let dateToTransformed = this.dateTo.toString().substring(0, 10);

    // Load form to edit
    this.subscription = this.reservationStorageService.getReservationById(this.id).subscribe(reservation => {
      this.reservation = reservation;

      // Navigate to the correct route for reservation with certain Id
      this.router.navigate([this.id + '/edit-reservation'], { queryParams: {'dateFrom': dateFromTransformed, 'dateTo': dateToTransformed, 'numOfPeople': this.numOfPeople, 'roomType': this.roomType} });
    }, err => {
      this.error = err;
      if (err.status === 400) {
        this.errMessage = `The request you sent to the server is not valid`;
      } else if (err.status === 404) {
        this.errMessage = `Reservation with id = ${this.id} NOT FOUND`;
      } else {
        this.errMessage = `Some error occured: ${err.message}`;
      }
      console.log(err) }
  )};
  
  onDeleteReservation(id: number, firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    
    //Delete reservation after user confirms it
    if (confirm("Are you sure you want to delete reservation for " + this.firstName + ' ' + this.lastName + ' ?')) {
      this.subscription = this.reservationStorageService.deleteReservation(id).subscribe(() => {
          this.id = id;
          this.dataSaved = true;
          this.message = 'Reservation for ' + this.firstName + ' ' + this.lastName + ' deleted successfully !';
          this.loadAllReservations();
          setTimeout(() => this.message = null, 3000); 
      }, err => {
        this.error = err;
        if (err.status === 400) {
          this.errMessage = `The request you sent to the server is not valid`;
        } else if (err.status === 404) {
          this.errMessage = `Reservation with id = ${id} NOT FOUND`;
        } else {
          this.errMessage = `Some error occured: ${err.message}`;
        }
        console.log(err) }
    )};
  };

  onHandleResponse() {
   this.router.navigate(['search-reservation']);
    this.error = null;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
