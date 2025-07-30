
// profile.page.ts
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  studentId: string;
  department: string;
  yearOfStudy: string;
  gpa: string;
  avatar: string;
}

interface Particle {
  transform: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('avatarImage', { static: false }) avatarImage!: ElementRef;

  profileForm!: FormGroup;
  userProfile!: UserProfile;
  isEditing = false;
  avatarUrl = '';
  isDragOver = false;
  particles: Particle[] = [];

  originalValues = {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@university.edu',
    phone: '+27 82 123 4567',
    dateOfBirth: '2002-03-15',
    gender: 'male',
    address: '123 University Ave, Durban, KZN 4001',
    studentId: 'STU2024001',
    department: 'computer-science',
    yearOfStudy: '3',
    gpa: '3.8'
  };

  departments = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business Administration' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'law', label: 'Law' },
    { value: 'arts', label: 'Arts & Literature' },
    { value: 'mathematics', label: 'Mathematics' }
  ];

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.initializeProfile();
    this.createForm();
    this.initializeParticles();
  }

  ngOnInit() {
    this.loadUserProfile();
    this.enableParallaxEffect();
  }

  initializeProfile() {
    this.userProfile = {
      id: '1',
      firstName: this.originalValues.firstName,
      lastName: this.originalValues.lastName,
      email: this.originalValues.email,
      phone: this.originalValues.phone,
      dateOfBirth: this.originalValues.dateOfBirth,
      gender: this.originalValues.gender,
      address: this.originalValues.address,
      studentId: this.originalValues.studentId,
      department: this.originalValues.department,
      yearOfStudy: this.originalValues.yearOfStudy,
      gpa: this.originalValues.gpa,
      avatar: ''
    };
    this.avatarUrl = this.userProfile.avatar;
  }

  createForm() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      dateOfBirth: ['', [Validators.required]],
      gender: [''],
      address: ['', [Validators.required]],
      studentId: ['', [Validators.required]],
      department: ['', [Validators.required]],
      yearOfStudy: ['', [Validators.required]],
      gpa: ['', [Validators.required, Validators.pattern(/^[0-4](\.[0-9])?$/)]]
    });

    // Set all fields to readonly initially
    this.setFormReadonly(true);
  }

  loadUserProfile() {
    this.profileForm.patchValue(this.userProfile);
  }

  initializeParticles() {
    this.particles = Array(5).fill(null).map(() => ({ transform: 'translate(0px, 0px)' }));
  }

  // Profile Avatar Functions
  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processImageFile(file);
      } else {
        this.showNotification('Please select an image file', 'warning');
      }
    }
  }

  processImageFile(file: File) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('File size must be less than 5MB', 'warning');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showNotification('Please select a valid image file', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
      this.userProfile.avatar = this.avatarUrl;

      // Add upload success animation
      const avatar = document.querySelector('.profile-avatar') as HTMLElement;
      if (avatar) {
        avatar.style.animation = 'none';
        avatar.style.transform = 'scale(1.1)';

        setTimeout(() => {
          avatar.style.transform = '';
          avatar.style.animation = 'pulse 2s ease-in-out infinite alternate';
        }, 300);
      }

      this.showNotification('Profile picture updated successfully!', 'success');
    };

    reader.onerror = () => {
      this.showNotification('Error reading file. Please try again.', 'error');
    };

    reader.readAsDataURL(file);
  }

  removeProfilePicture() {
    this.avatarUrl = '';
    this.userProfile.avatar = '';

    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // Add removal animation
    const avatar = document.querySelector('.profile-avatar') as HTMLElement;
    if (avatar) {
      avatar.style.animation = 'none';
      avatar.style.transform = 'scale(0.9)';

      setTimeout(() => {
        avatar.style.transform = '';
        avatar.style.animation = 'pulse 2s ease-in-out infinite alternate';
      }, 300);
    }

    this.showNotification('Profile picture removed', 'info');
  }

  // Navigation Functions
  goBack() {
    console.log('Navigating back to menu...');
    // Add smooth exit animation
    const wrapper = document.querySelector('.profile-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.style.animation = 'fadeOutDown 0.5s ease-in-out';
    }

    setTimeout(() => {
      this.navCtrl.back();
      this.showNotification('Navigating to menu page...', 'info');
    }, 500);
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    this.setFormReadonly(!this.isEditing);

    if (this.isEditing) {
      this.showNotification('Edit mode enabled', 'info');
    } else {
      // If exiting edit mode without saving, reload original values
      this.loadUserProfile();
      this.showNotification('Edit mode disabled', 'info');
    }
  }

  setFormReadonly(readonly: boolean) {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        if (readonly) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }

  // Form Functions
  async saveProfile() {
    if (this.profileForm.valid) {
      // Simulate API call delay
      await this.delay(1000);

      // Update user profile with form values
      this.userProfile = { ...this.userProfile, ...this.profileForm.value };
      
      // Update original values
      Object.assign(this.originalValues, this.profileForm.value);

      this.isEditing = false;
      this.setFormReadonly(true);

      this.showNotification('Profile saved successfully!', 'success');
    } else {
      this.showNotification('Please fill in all required fields correctly', 'error');
      this.markFormGroupTouched();
    }
  }

  resetForm() {
    console.log('Form reset');
    
    // Reset form to original values
    this.profileForm.patchValue(this.originalValues);
    
    // Reset avatar
    this.avatarUrl = '';
    this.userProfile.avatar = '';
    
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.showNotification('Form reset to original values', 'info');
  }

  // Utility Functions
  getInitials(): string {
    return `${this.userProfile.firstName.charAt(0)}${this.userProfile.lastName.charAt(0)}`;
  }

  getDepartmentLabel(value: string): string {
    const dept = this.departments.find(d => d.value === value);
    return dept ? dept.label : value;
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Validation Functions
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phone: string): boolean {
    const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
  }

  validateGPA(gpa: string): boolean {
    const num = parseFloat(gpa);
    return !isNaN(num) && num >= 0 && num <= 4;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Please enter a valid phone number';
        if (fieldName === 'gpa') return 'GPA must be between 0 and 4';
        return `Please enter a valid ${fieldName}`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // Enhanced Parallax Effect for Background Particles
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;

    this.particles.forEach((particle, index) => {
      const speed = (index + 1) * 0.3;
      const xPos = (x - 0.5) * speed * 30;
      const yPos = (y - 0.5) * speed * 30;
      particle.transform = `translate(${xPos}px, ${yPos}px)`;
    });
  }

  enableParallaxEffect() {
    // This method can be used to initialize any additional parallax effects
    console.log('Parallax effect enabled');
  }

  // Notification System
  private async showNotification(message: string, type: 'success' | 'warning' | 'error' | 'info') {
    let color = 'primary'; // default info
    if (type === 'success') color = 'success';
    if (type === 'warning') color = 'warning';
    if (type === 'error') color = 'danger';

    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      color,
      position: 'top',
      cssClass: `custom-toast toast-${type}`,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced form interactions
  onInputFocus(event: any) {
    const element = event.target;
    if (element) {
      element.style.transform = 'translateY(-2px)';
    }
  }

  onInputBlur(event: any) {
    const element = event.target;
    if (element) {
      element.style.transform = '';
    }

    // Real-time validation
    const fieldName = event.target.getAttribute('formControlName');
    if (fieldName) {
      this.validateField(fieldName);
    }
  }

  private validateField(fieldName: string) {
    const field = this.profileForm.get(fieldName);
    if (field && field.value) {
      switch (fieldName) {
        case 'email':
          if (!this.validateEmail(field.value)) {
            this.showNotification('Please enter a valid email address', 'warning');
          }
          break;
        case 'phone':
          if (!this.validatePhone(field.value)) {
            this.showNotification('Please enter a valid phone number', 'warning');
          }
          break;
        case 'gpa':
          if (!this.validateGPA(field.value)) {
            this.showNotification('GPA must be between 0 and 4', 'warning');
          }
          break;
      }
    }
  }

  // Button press animations
  onButtonPress(event: any) {
    const button = event.target.closest('ion-button');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    }
  }
}
