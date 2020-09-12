import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  isCollapsed = true;
  
  // Property defined for updating the navigation bar based on loginStatus
  loginStatus$ : Observable<boolean>;
  username$ : Observable<string>;
  
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loginStatus$ = this.authService.loginStatus;
    this.username$ = this.authService.username;
  }

  collapse() {
    this.isCollapsed = false;
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  onLogout() {
    this.authService.logout();
    console.log(localStorage.getItem('token'));
  }
}
