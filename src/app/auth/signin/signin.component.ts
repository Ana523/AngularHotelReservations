import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  signInForm: FormGroup;
  error = null;
  message: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.signInForm = new FormGroup({
      username: new FormControl(null),
      pwd: new FormControl(null)
    });

    if (localStorage.getItem('token') != null) {
      this.router.navigate(['home']);
    };
  }

  onSubmit() {
    this.authService.existingUser.UserName = this.signInForm.value.username;
    this.authService.existingUser.Password = this.signInForm.value.pwd;

    // Call signin method from auth service
    this.authService.signin().subscribe((res:any) => {
      this.authService.loginStatus.next(true);
      this.authService.username.next(this.authService.existingUser.UserName);

      // Store token and username in local storage
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", this.authService.existingUser.UserName);

      // Set loggedIn property to true
      localStorage.setItem('loggedIn', 'true');
      this.router.navigate(['home']);
    }, err => { 
      this.error = err;
      if(err.status === 400) {
        this.message = 'Incorrect username or password!';
      } else {
        console.log(err);
      }
    })
  }

  onHandleResponse() {
    this.error = null;
    this.signInForm.reset();
  }
}
