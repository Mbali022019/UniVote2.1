import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./registerone.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  selectedFile: File | null = null;

  constructor() { }

  ngOnInit() {
  }

  // Handle manual form submission
  onSubmit() {
    // Get form values
    const surname = (document.getElementById('surname') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
    const course = (document.getElementById('course') as HTMLInputElement).value;
    const year = (document.getElementById('year') as HTMLInputElement).value;
    const faculty = (document.getElementById('faculty') as HTMLInputElement).value;

    // Validate form
    if (!surname || !phone || !course || !year || !faculty) {
      alert('Please fill in all fields');
      return;
    }

    // Create registration object
    const registration = {
      surname: surname,
      phone: phone,
      course: course,
      year: parseInt(year),
      faculty: faculty
    };

    console.log('Registration data:', registration);
    
    // TODO: Send registration data to your backend/service
    // this.registerService.addRegistration(registration);
    
    // Clear form after successful submission
    this.clearForm();
    alert('Registration successful!');
  }

  // Handle file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById('fileInfo') as HTMLElement;
    const fileName = document.getElementById('fileName') as HTMLElement;
    
    if (file) {
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV file');
        event.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      fileName.textContent = file.name;
      fileInfo.style.display = 'flex';

      console.log('File selected:', file.name);
      
      // TODO: Process the file
      // this.processSpreadsheet(file);
    }
  }

  // Remove selected file
  removeFile() {
    const fileInput = document.getElementById('spreadsheet') as HTMLInputElement;
    const fileInfo = document.getElementById('fileInfo') as HTMLElement;
    
    fileInput.value = '';
    fileInfo.style.display = 'none';
    this.selectedFile = null;
  }

  // Process spreadsheet file (placeholder for actual implementation)
  processSpreadsheet(file: File) {
    // TODO: Implement spreadsheet processing
    // You can use libraries like:
    // - xlsx for Excel files
    // - papaparse for CSV files
    
    console.log('Processing file:', file.name);
    
    // Example implementation would read the file and extract registration data
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   // Process file content
    // };
    // reader.readAsArrayBuffer(file);
  }

  // Clear the manual registration form
  private clearForm() {
    (document.getElementById('surname') as HTMLInputElement).value = '';
    (document.getElementById('phone') as HTMLInputElement).value = '';
    (document.getElementById('course') as HTMLInputElement).value = '';
    (document.getElementById('year') as HTMLInputElement).value = '';
    (document.getElementById('faculty') as HTMLInputElement).value = '';
  }

}
