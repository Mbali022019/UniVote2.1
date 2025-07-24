import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor() { }

  ngOnInit() {
  }

  login() {
    if (this.email && this.password) {
      console.log('Login attempt:', {
        email: this.email,
        password: this.password
      });
      
      // Add your authentication logic here
      // For example:
      // this.authService.login(this.email, this.password).subscribe(
      //   response => {
      //     // Handle successful login
      //     console.log('Login successful', response);
      //     // Navigate to home page or dashboard
      //   },
      //   error => {
      //     // Handle login error
      //     console.error('Login failed', error);
      //     // Show error message to user
      //   }
      // );
    } else {
      console.log('Please fill in all fields');
      // You might want to show a toast or alert here
    }
  }
}
