// profile.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, ToastController, Platform, ModalController } from '@ionic/angular';
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
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

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
  
  // Camera modal properties
  showCameraModal = false;
  cameraStream: MediaStream | null = null;
  isCameraActive = false;

  // Platform detection
  isNativePlatform = false;
  isWebPlatform = false;

  constructor(
    private formBuilder: FormBuilder,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private modalController: ModalController
  ) {
    this.initializeForm();
    this.generateParticles();
    this.detectPlatform();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.stopCameraStream();
  }

  private detectPlatform() {
    this.isNativePlatform = this.platform.is('cordova') || this.platform.is('capacitor');
    this.isWebPlatform = this.platform.is('desktop') || this.platform.is('mobileweb');
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

    const buttons: any[] = [];

    // Always show camera option - let the method handle platform differences
    buttons.push({
      text: 'Take Photo',
      icon: 'camera-outline',
      handler: () => {
        this.openCameraInterface();
      }
    });

    // Gallery/file selection is always available
    buttons.push({
      text: this.isNativePlatform ? 'Choose from Gallery' : 'Upload Photo',
      icon: 'images-outline',
      handler: () => {
        this.selectFromGallery();
      }
    });

    // Remove picture option
    if (this.avatarUrl) {
      buttons.push({
        text: 'Remove Picture',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => {
          this.removeProfilePicture();
        }
      });
    }

    // Cancel option
    buttons.push({
      text: 'Cancel',
      icon: 'close-outline',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Update Profile Picture',
      cssClass: 'custom-action-sheet',
      buttons: buttons
    });
    await actionSheet.present();
  }

  async openCameraInterface() {
    try {
      if (this.isNativePlatform) {
        // For native platforms, we'll still use the native camera with editing enabled
        // But you could also implement a custom camera interface if preferred
        await this.takePhotoWithCapacitorCamera();
      } else {
        // For web platforms, open the custom camera modal
        await this.openWebCameraModal();
      }
    } catch (error) {
      console.error('Camera error:', error);
      this.handleCameraError(error);
    }
  }

  private async takePhotoWithCapacitorCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true, // This allows users to crop/adjust before confirming
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 400,
        height: 400,
        saveToGallery: false,
        correctOrientation: true,
        promptLabelHeader: 'Take Photo',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'From Photos',
        promptLabelPicture: 'Take Picture'
      });

      if (image.dataUrl) {
        this.avatarUrl = image.dataUrl;
        this.userProfile.avatarUrl = image.dataUrl;
        this.showToast('Photo captured successfully!', 'success');
      }
    } catch (error: any) {
      if (error.message && error.message.includes('cancelled')) {
        // User cancelled, don't show error
        return;
      }
      throw error;
    }
  }

  private async openWebCameraModal() {
    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('Camera not supported');
      }

      this.showCameraModal = true;
      await this.initializeCamera();
    } catch (error) {
      console.error('Camera access failed:', error);
      // Fallback to file input with camera capture
      this.cameraInput.nativeElement.setAttribute('capture', 'camera');
      this.cameraInput.nativeElement.click();
    }
  }

  private async initializeCamera() {
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 400 },
          height: { ideal: 400 }
        }
      });

      // Wait for the next tick to ensure the video element is rendered
      setTimeout(() => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.cameraStream;
          this.videoElement.nativeElement.play();
          this.isCameraActive = true;
        }
      }, 100);

    } catch (error) {
      console.error('Failed to initialize camera:', error);
      this.closeCameraModal();
      throw error;
    }
  }

  capturePhoto() {
    if (!this.cameraStream || !this.videoElement || !this.canvasElement) {
      this.showToast('Camera not ready', 'error');
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d')!;

    // Set canvas dimensions
    canvas.width = 400;
    canvas.height = 400;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    this.avatarUrl = dataUrl;
    this.userProfile.avatarUrl = dataUrl;
    
    this.closeCameraModal();
    this.showToast('Photo captured successfully!', 'success');
  }

  retakePhoto() {
    // Just keep the camera running for another attempt
    this.showToast('Ready to take another photo', 'warning');
  }

  closeCameraModal() {
    this.showCameraModal = false;
    this.stopCameraStream();
  }

  private stopCameraStream() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.isCameraActive = false;
  }

  switchCamera() {
    if (!this.cameraStream) return;

    // Stop current stream
    this.stopCameraStream();

    // Determine the current facing mode and switch
    const currentMode = this.cameraStream ? 'user' : 'environment';
    const newMode = currentMode === 'user' ? 'environment' : 'user';

    // Reinitialize with the new facing mode
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: newMode,
        width: { ideal: 400 },
        height: { ideal: 400 }
      }
    }).then(stream => {
      this.cameraStream = stream;
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play();
      }
    }).catch(error => {
      console.error('Failed to switch camera:', error);
      this.showToast('Failed to switch camera', 'error');
      // Fallback to original mode
      this.initializeCamera();
    });
  }

  async selectFromGallery() {
    try {
      if (this.isNativePlatform) {
        // Use Capacitor Camera for native platforms
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
          width: 400,
          height: 400,
          correctOrientation: true
        });

        if (image.dataUrl) {
          this.avatarUrl = image.dataUrl;
          this.userProfile.avatarUrl = image.dataUrl;
          this.showToast('Photo selected successfully!', 'success');
        }
      } else {
        // Use file input for web platforms
        this.fileInput.nativeElement.click();
      }
    } catch (error: any) {
      if (error.message && error.message.includes('cancelled')) {
        // User cancelled, don't show error
        return;
      }
      console.error('Gallery selection error:', error);
      this.showToast('Unable to access gallery. Please try uploading a file instead.', 'error');
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
    } else if (file) {
      this.showToast('Please select a valid image file', 'error');
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showToast('Please select a valid image format (JPEG, PNG, GIF, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Optionally resize the image before setting it
      this.resizeImage(e.target.result, 400, 400).then(resizedImage => {
        this.avatarUrl = resizedImage;
        this.userProfile.avatarUrl = resizedImage;
      });
    };
    reader.onerror = () => {
      this.showToast('Error reading the image file', 'error');
    };
    reader.readAsDataURL(file);
  }

  private resizeImage(dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (!this.isEditing) return;

    const files = event.dataTransfer?.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      this.processImageFile(files[0]);
      this.showToast('Photo uploaded successfully!', 'success');
    } else {
      this.showToast('Please drop a valid image file', 'error');
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

  private handleCameraError(error: any) {
    console.error('Camera error:', error);
    
    let message = 'Unable to access camera. ';
    
    if (error.message) {
      if (error.message.includes('permission')) {
        message += 'Please enable camera permissions in your browser/device settings.';
      } else if (error.message.includes('not found')) {
        message += 'No camera found on this device.';
      } else {
        message += 'Please try uploading a photo instead.';
      }
    } else {
      message += 'Please try uploading a photo instead.';
    }

    this.showToast(message, 'error');
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
        this.showDatePicker = false;
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
    this.router.navigate(['/menu']);
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