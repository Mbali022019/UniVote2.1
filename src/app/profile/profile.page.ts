// profile.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';

interface UserProfile {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  department: string;
  yearOfStudy: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dateTimePicker') dateTimePicker!: any;

  profileForm!: FormGroup;
  userProfile: UserProfile = {
    studentId: 'STU2024001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    phone: '+1 234 567 8900',
    dateOfBirth: '2000-01-15',
    gender: 'male',
    address: '123 University Avenue, Campus City, State 12345',
    department: 'Computer Science',
    yearOfStudy: '3',
    avatarUrl: ''
  };

  isEditing = false;
  isDragOver = false;
  avatarUrl = '';
  particles: any[] = [];
  showDatePicker = false;

  constructor(
    private formBuilder: FormBuilder,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {
    this.initializeForm();
    this.generateParticles();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private initializeForm() {
    this.profileForm = this.formBuilder.group({
      firstName: [this.userProfile.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.userProfile.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.userProfile.email, [Validators.required, Validators.email]],
      phone: [this.userProfile.phone, [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      dateOfBirth: [this.userProfile.dateOfBirth, [Validators.required]],
      gender: [this.userProfile.gender],
      address: [this.userProfile.address, [Validators.required, Validators.minLength(10)]],
      studentId: [this.userProfile.studentId, [Validators.required]],
      department: [this.userProfile.department, [Validators.required]],
      yearOfStudy: [this.userProfile.yearOfStudy, [Validators.required]]
    });
  }

  private generateParticles() {
    this.particles = Array.from({ length: 5 }, (_, i) => ({
      transform: `translate(${Math.random() * 100}vw, ${Math.random() * 100}vh)`
    }));
  }

  private loadUserProfile() {
    // Load user profile from storage or API
    // For demo purposes, using the initialized data
    this.avatarUrl = this.userProfile.avatarUrl || '';
  }

  openDatePicker() {
    if (!this.isEditing) return;
    this.showDatePicker = !this.showDatePicker;
  }

  onDateChange(event: any) {
    const selectedDate = event.detail.value;
    this.profileForm.patchValue({ dateOfBirth: selectedDate });
    this.showDatePicker = false;
  }

  async showProfilePictureOptions() {
    if (!this.isEditing) return;

    const actionSheet = await this.actionSheetController.create({
      header: 'Update Profile Picture',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => {
            this.takePhotoWithCamera();
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.selectFromGallery();
          }
        },
        {
          text: 'Remove Picture',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.removeProfilePicture();
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePhotoWithCamera() {
    try {
      // First try to use Capacitor Camera to open actual camera app
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // This opens the actual camera app
        width: 400,
        height: 400,
        saveToGallery: false
      });

      if (image.dataUrl) {
        this.avatarUrl = image.dataUrl;
        this.userProfile.avatarUrl = image.dataUrl;
        this.showToast('Photo captured successfully!', 'success');
      }
    } catch (error) {
      console.log('Camera not available:', error);
      
      // Enhanced fallback - try to request camera permissions first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Request camera permission and open camera
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          });
          
          // Stop the stream immediately as we just needed permission
          stream.getTracks().forEach(track => track.stop());
          
          // Now try the file input with camera
          this.cameraInput.nativeElement.click();
        } catch (permissionError) {
          console.log('Camera permission denied:', permissionError);
          this.showToast('Camera access denied. Please enable camera permissions.', 'error');
        }
      } else {
        // Final fallback
        this.cameraInput.nativeElement.click();
      }
    }
  }

  async selectFromGallery() {
    try {
      // Try Capacitor Camera first (for mobile devices)
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 400,
        height: 400
      });

      if (image.dataUrl) {
        this.avatarUrl = image.dataUrl;
        this.userProfile.avatarUrl = image.dataUrl;
        this.showToast('Photo selected successfully!', 'success');
      }
    } catch (error) {
      console.log('Capacitor Camera not available, falling back to file input');
      // Fallback to file input for web
      this.fileInput.nativeElement.click();
    }
  }

  handleCameraCapture(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processImageFile(file);
      this.showToast('Photo captured successfully!', 'success');
    }
    // Reset the input
    event.target.value = '';
  }

  handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processImageFile(file);
      this.showToast('Photo uploaded successfully!', 'success');
    }
    // Reset the input
    event.target.value = '';
  }

  private processImageFile(file: File) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
      this.userProfile.avatarUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (!this.isEditing) return;

    const files = event.dataTransfer?.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      this.processImageFile(files[0]);
      this.showToast('Photo uploaded successfully!', 'success');
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (this.isEditing) {
      this.isDragOver = true;
    }
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  async removeProfilePicture() {
    const alert = await this.alertController.create({
      header: 'Remove Profile Picture',
      message: 'Are you sure you want to remove your profile picture?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.avatarUrl = '';
            this.userProfile.avatarUrl = '';
            this.showToast('Profile picture removed', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  getInitials(): string {
    const firstName = this.profileForm.get('firstName')?.value || this.userProfile.firstName;
    const lastName = this.profileForm.get('lastName')?.value || this.userProfile.lastName;
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  toggleEditMode() {
    if (this.isEditing) {
      this.saveProfile();
    } else {
      this.isEditing = true;
      this.showToast('Edit mode enabled', 'warning');
    }
  }

  getFormattedDate(dateValue: string): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async saveProfile() {
    if (this.profileForm.valid) {
      try {
        // Update user profile with form values
        Object.keys(this.profileForm.controls).forEach(key => {
          (this.userProfile as any)[key] = this.profileForm.get(key)?.value;
        });

        // Here you would typically save to a service or API
        // await this.profileService.updateProfile(this.userProfile);

        this.isEditing = false;
        this.showDatePicker = false; // Hide date picker when saving
        this.showToast('Profile saved successfully!', 'success');
      } catch (error) {
        console.error('Error saving profile:', error);
        this.showToast('Failed to save profile', 'error');
      }
    } else {
      this.showToast('Please fill in all required fields correctly', 'error');
      this.markFormGroupTouched();
    }
  }

  resetForm() {
    this.profileForm.reset();
    this.loadUserProfile();
    this.initializeForm();
    this.showDatePicker = false;
    this.showToast('Form reset successfully', 'warning');
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/menu']); // Adjust route as needed
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      cssClass: `custom-toast toast-${type}`,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}