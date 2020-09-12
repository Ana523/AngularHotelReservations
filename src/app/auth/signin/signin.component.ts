import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  isLoading: boolean;

  // Error messages
  errMes = "This field is required!";
  minLenErrMes = "Password must be at least 8 characters long!";
  regexPwd = "Password must contain at least one uppercase and lowercase letter, one number and at one of these characters: #, $, @ or &!";
  userNameRegexErr = "User Name must only contain uppercase and lowercase letters and numbers, no spaces allowed!";
  
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.signInForm = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)]),
      pwd: new FormControl(null, [Validators.required, 
                                  Validators.minLength(8), 
                                  Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#$@&])/)])
    });

    if (localStorage.getItem('token') != null) {
      this.router.navigate(['home']);
    };
  }

  onSubmit() {
    this.authService.existingUser.UserName = this.signInForm.value.username;
    this.authService.existingUser.Password = this.signInForm.value.pwd;
    
    this.isLoading = true;
    // Call signin method from auth service
    this.authService.signin().subscribe((res:any) => {
      this.isLoading = false;
      this.authService.loginStatus.next(true);
      this.authService.username.next(this.authService.existingUser.UserName);
      
      // Calculate expiration duration to, after the token expires, automatically logout
      const expirationDuration = Date.parse(res.ExpirationTime) - Date.now();
      this.authService.autoLogout(expirationDuration);
      
      // Store token, token expiration time and username in local storage
      localStorage.setItem("token", res.token);
      localStorage.setItem("tokenExpTime", res.ExpirationTime);
      localStorage.setItem("username", this.authService.existingUser.UserName);

      // Set loggedIn property to true
      localStorage.setItem('loggedIn', 'true');
      this.router.navigate(['home']);
    }, err => { 
      this.isLoading = false;
      this.error = err;
      if(err.status === 400) {
        this.message = 'Incorrect username or password!';
      } else {
        this.message = `Some error occured: ${err.message}`;
        console.log(err);
      }
    })
  }

  onHandleResponse() {
    this.error = null;
    this.signInForm.reset();
  }
}
