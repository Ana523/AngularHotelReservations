import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  message:string = '';
  error = null;
  success = false;

  // Error messages
  errMes = "This field is required!";
  minLenErrMes = "Password must be at least 8 characters long!";
  regexPwd = "Password must contain at least one uppercase and lowercase letter, one number and at one of these characters: #, $, @ or &!";
  emailErrMes = "Email is not valid!";
  pwdMismatchErr: string = "Your passwords don't match!";

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  signUpForm = this.fb.group({
    username: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    passwords: this.fb.group({
      pwd: ['', [Validators.required, 
                 Validators.minLength(8), 
                 Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#$@&])/)]],
      repeatPwd: ['', Validators.required]
    }, {validator : this.comparePasswords})
  })

  ngOnInit() {
    
  }

  onSubmit() {
    this.authService.user.Username = this.signUpForm.value.username,
    this.authService.user.FullName = this.signUpForm.value.fullName,
    this.authService.user.Email = this.signUpForm.value.email,
    this.authService.user.Password = this.signUpForm.value.passwords.pwd
    
    // Call addNewUser method from auth service
    this.authService.addNewUser().subscribe((res: any) => {
      if (res.Succeeded) {
        this.success = true;
        this.message = 'You have successfully Signed Up! Please Sign In to start using the application!';
        setTimeout(() => this.router.navigate(['signin']), 4000);
      } else {
        // Handle Errors
        res.Errors.forEach(element => {
          this.error = element;
          switch(element.Code) {
            case 'DuplicateUserName':
              this.message = `Username ${this.authService.user.Username} is already taken!`;
            break;
            default:
              this.message = 'There was some error with Signing Up! Please try again!'
            break;
          }
        })
      }
    }, err => console.log(err));
  }

  // Custom validator to compare values of passwords 
  comparePasswords(fb: FormGroup) {
    // Store repeatPwd control in a variable
    let confirmPwdCtrl = fb.get('repeatPwd');

    // Check if there are no other errors in repeatPwd field or if there is a passwordMismatch error
    if (confirmPwdCtrl.errors == null || 'passwordMismatch' in confirmPwdCtrl.errors) {

      // Compare values of pwd and repeatPwd field
      if(fb.get('pwd').value != confirmPwdCtrl.value) {
        confirmPwdCtrl.setErrors({ passwordMismatch: true });
      } else {
        confirmPwdCtrl.setErrors(null);
      }
    }
  }

  onHandleResponse() {
    if (this.success) {
      this.router.navigate(['home']);
    }
    this.error = null;
    this.success = null;
    this.signUpForm.reset();
  }
}
