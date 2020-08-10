import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Reservation } from './reservation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ReservationStorageService {
  reservation: Reservation;
  dbUrl = 'http://localhost:61038/api/reservation';
  
  constructor(private http: HttpClient) {
    
  }

  getReservationsFromDb(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.dbUrl + '/GetReservations')
  }

  storeReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.dbUrl + '/AddNewReservation', reservation);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(this.dbUrl + '/GetReservationById/' + id);
  }

  editReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(this.dbUrl + '/EditReservation/', reservation);
  }

  deleteReservation(id: number) {
    return this.http.delete<number>(this.dbUrl + '/DeleteReservation/' + id);
  }
}
