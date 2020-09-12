import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  dbUrl = 'http://localhost:61038/api/ApplicationUser';

  loginStatus = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('loggedIn') || 'false' ));
  username = new BehaviorSubject<string>((localStorage.getItem('username') || ''));
  private tokenExpirationTimer: any;

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

  autoLogin() {
    const loggedIn = localStorage.getItem('loggedIn');
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const tokenExpDate = localStorage.getItem('tokenExpTime');

    if (!loggedIn && !username && !token && !tokenExpDate) {
      return;
    }
    if (token && Date.parse(tokenExpDate) > Date.now()) {
      // Calculate the remaining time after witch the token expires
      const expirationDuration = Date.parse(tokenExpDate) - Date.now();
      this.loginStatus.next(true);
      this.username.next(username);
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.loginStatus.next(false);
    this.username.next('');

    // Remove items from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('tokenExpTime');

    // Set loggedIn property to false
    localStorage.setItem('loggedIn', 'false');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.router.navigate(['signin']);
  }
  
  autoLogout(expirationDuration) {
    this.tokenExpirationTimer = setTimeout(() => 
      this.logout(), expirationDuration);
  }
}
