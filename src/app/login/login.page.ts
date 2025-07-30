import { Component } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  private generatedCode: string = '';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  validatePassword(password: string): boolean {
    // Minimum 10 characters, at least one uppercase, one lowercase, one number, one special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{10,}$/;
    return re.test(password);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.email || !this.password) {
      this.presentToast('Please fill in all fields.', 'warning');
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.presentToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (!this.validatePassword(this.password)) {
      this.presentToast('Password must be at least 10 characters and include upper, lower, number, and special character.', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Signing in...' });
    await loading.present();

    // Simulate login call (replace with real API)
    setTimeout(async () => {
      await loading.dismiss();
      this.isLoading = false;

      // For demo, let's assume login success if email contains "valid"
      if (this.email.includes('valid')) {
        this.presentToast('Login successful!', 'success');
        // Navigate to another page here if needed
      } else {
        this.presentToast('Login failed. Please check your credentials.', 'danger');
      }
    }, 1500);
  }

  async forgotPassword() {
    const emailAlert = await this.alertCtrl.create({
      header: 'Reset Password',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Enter your email',
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Send Code',
          handler: (data) => {
            if (!data.email || !this.validateEmail(data.email)) {
              this.presentToast('Please enter a valid email.', 'danger');
              return false;
            }

            this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            console.log('Verification code:', this.generatedCode);

            // TODO: Send this.generatedCode to user's email via backend service

            this.presentToast(`Verification code sent to ${data.email}`, 'success');
            this.promptForCode();
            return true;
          }
        }
      ]
    });

    await emailAlert.present();
  }

  async promptForCode() {
    const codeAlert = await this.alertCtrl.create({
      header: 'Enter Verification Code',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Enter the code you received',
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Verify',
          handler: (data) => {
            if (data.code !== this.generatedCode) {
              this.presentToast('Incorrect code. Please try again.', 'danger');
              return false;
            }
            this.promptForNewPassword();
            return true;
          }
        }
      ]
    });

    await codeAlert.present();
  }

  async promptForNewPassword() {
    const passAlert = await this.alertCtrl.create({
      header: 'Set New Password',
      inputs: [
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New password',
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm new password',
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset Password',
          handler: (data) => {
            const { newPassword, confirmPassword } = data;
            if (!newPassword || !confirmPassword) {
              this.presentToast('Please fill in both password fields.', 'warning');
              return false;
            }
            if (!this.validatePassword(newPassword)) {
              this.presentToast('Password must be at least 10 characters and include upper, lower, number, and special character.', 'warning');
              return false;
            }
            if (newPassword !== confirmPassword) {
              this.presentToast('Passwords do not match.', 'danger');
              return false;
            }

            // TODO: Call backend API to update password for the email

            this.presentToast('Password has been reset successfully.', 'success');

            // Auto-fill new password in the form for login
            this.password = newPassword;

            return true;
          }
        }
      ]
    });

    await passAlert.present();
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    toast.present();
  }
}


