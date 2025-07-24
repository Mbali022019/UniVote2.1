import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  studentId: string;
  department: string;
  avatar: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  userProfile!: UserProfile;
  isEditing = false;
  avatarUrl = '';

  departments = [
    'Computer Science',
    'Engineering', 
    'Business Administration',
    'Psychology',
    'Medicine',
    'Law',
    'Arts & Literature',
    'Mathematics'
  ];

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    this.initializeProfile();
    this.createForm();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  initializeProfile() {
    this.userProfile = {
      id: '1',
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@university.edu',
      phone: '+27 82 123 4567',
      dateOfBirth: '2002-03-15',
      address: '123 University Ave, Durban, KZN 4001',
      studentId: 'STU2024001',
      department: 'Computer Science',
      avatar: 'https://via.placeholder.com/150/4285f4/ffffff?text=AJ'
    };
    this.avatarUrl = this.userProfile.avatar;
  }

  createForm() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
      dateOfBirth: ['', [Validators.required]],
      address: ['', [Validators.required]],
      studentId: ['', [Validators.required]],
      department: ['', [Validators.required]]
    });
  }

  loadUserProfile() {
    this.profileForm.patchValue(this.userProfile);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile();
    }
  }

  async saveProfile() {
    if (this.profileForm.valid) {
      this.userProfile = { ...this.userProfile, ...this.profileForm.value };
      await this.delay(1000);
      this.isEditing = false;
      this.showToast('Profile updated successfully!', 'success');
    } else {
      this.showToast('Please fill in all required fields correctly.', 'danger');
    }
  }

  async changeAvatar() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Change Profile Picture',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'images',
          handler: () => {
            this.chooseFromGallery();
          }
        },
        {
          text: 'Remove Photo',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.removePhoto();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  takePhoto() {
    this.showToast('Camera functionality would be implemented here', 'tertiary');
  }

  chooseFromGallery() {
    const avatars = [
      'https://via.placeholder.com/150/ff6b6b/ffffff?text=A',
      'https://via.placeholder.com/150/4ecdc4/ffffff?text=A',
      'https://via.placeholder.com/150/45b7d1/ffffff?text=A',
      'https://via.placeholder.com/150/f39c12/ffffff?text=A'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    this.avatarUrl = randomAvatar;
    this.userProfile.avatar = randomAvatar;
    this.showToast('Avatar updated!', 'success');
  }

  removePhoto() {
    this.avatarUrl = 'https://via.placeholder.com/150/cccccc/666666?text=No+Image';
    this.userProfile.avatar = this.avatarUrl;
    this.showToast('Avatar removed', 'medium');
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `Please enter a valid ${fieldName}`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  goBack() {
    this.navCtrl.back();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
