import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  dbUrl = 'http://localhost:61038/api/ApplicationUser';

  loginStatus = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('loggedIn') || 'false' ));
  username = new BehaviorSubject<string>((localStorage.getItem('username') || ''));

  user = {
    Username: '',
    FullName: '',
    Email: '',
    Password: ''
  };
  
  existingUser = {
    UserName: '',
    Password: ''
  }
  
  constructor(private http: HttpClient, private router: Router) { }

  addNewUser() {
    return this.http.post(this.dbUrl + "/SignUp", this.user);
  }

  signin() {
    return this.http.post(this.dbUrl + "/SignIn", this.existingUser);
  }

  logout() {
    this.loginStatus.next(false);
    this.username.next('');

    // Remove items from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    // Set loggedIn property to false
    localStorage.setItem('loggedIn', 'false');
    this.router.navigate(['signin']);
  }
}
