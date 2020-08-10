import { Component, OnInit, OnDestroy } from '@angular/core';
import { Reservation } from '../shared/reservation.model';
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
  dataSaved: boolean = false;
  message: string = null;

  // Properties defined for filter pipe
  filteredFirstName: string = '';
  filteredLastName: string = '';
  filteredDateFrom: string = '';
  filteredDateTo: string = '';

  constructor(private reservationStorageService: ReservationStorageService, 
              private router: Router) {

  }

  ngOnInit() {
    this.loadAllReservations();
  }

  loadAllReservations() {
    this.subscription = this.reservationStorageService.getReservationsFromDb().subscribe(reservations =>
      this.reservations = reservations
    ), error => console.log(error);
  }

  onLoadReservation(id: number) {
    // Store id of a reservation
    this.id = id;

    // Load form to edit
    this.subscription = this.reservationStorageService.getReservationById(this.id).subscribe(reservation => {
      this.reservation = reservation;
    });

    // Navigate to the correct route for reservation with certain Id
    this.router.navigate([this.id + '/edit-reservation']);
  }
  
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
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
