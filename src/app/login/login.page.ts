import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    // Initialize any setup logic here if needed
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      // Simulate API call - replace with your actual authentication service
      await this.simulateLogin();
      
      this.showToast('Login successful! Redirecting...', 'success');
      
      // Navigate to your main page/dashboard
      setTimeout(() => {
        this.router.navigate(['/register']); // Replace with your route
        this.isLoading = false;
      }, 1500);
      
    } catch (error) {
      this.isLoading = false;
      this.showToast('Login failed. Please check your credentials.', 'danger');
    }
  }

  async forgotPassword() {
    this.showToast('Password reset link sent to your email!', 'primary');
    // Implement forgot password logic here
  }

  private async simulateLogin(): Promise<void> {
    // Simulate API delay - replace this with your actual authentication service
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure based on credentials
        if (this.email && this.password) {
          // You can add more validation here
          console.log('Login attempt:', {
            email: this.email,
            password: this.password
          });
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 2000);
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      cssClass: 'custom-toast'
    });
    toast.present();
  }
}
