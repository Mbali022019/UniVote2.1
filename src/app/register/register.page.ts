import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, documentOutline, close, trashOutline, menuOutline, homeOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';

interface Staff {
  surname: string;
  phone: string;
  course: string;
  year: number | string;
  faculty: string;
}

interface Student {
  surname: string;
  phone: string;
  course: string;
  year: number | string;
  faculty: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class RegisterPage implements OnInit {
  
  staff: Staff = {
    surname: '',
    phone: '',
    course: '',
    year: '',
    faculty: ''
  };
  
  selectedFile: File | null = null;
  uploadedStudents: Student[] = [];
  processing = false;
  
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) {
    // Register the icons including navigation icons
    addIcons({ cloudUploadOutline, documentOutline, close, trashOutline, menuOutline, homeOutline });
  }

  ngOnInit() {
    console.log('Register page initialized');
  }

  // Navigation method to menu page
  goToMenu() {
    console.log('Navigating to menu page...');
    this.router.navigate(['/menu']).then(
      (success) => console.log('Navigation to menu success:', success),
      (error) => console.log('Navigation to menu error:', error)
    );
  }

  // Alternative navigation method to home page
  goToHome() {
    console.log('Navigating to home page...');
    this.router.navigate(['/home']).then(
      (success) => console.log('Navigation to home success:', success),
      (error) => console.log('Navigation to home error:', error)
    );
  }

  async addStaff() {
    if (this.isValidStaff(this.staff)) {
      try {
        // Here you would typically save to a database
        // For now, we'll just show a success message
        await this.showToast('Staff member added successfully!', 'success');
        
        // Reset form
        this.staff = {
          surname: '',
          phone: '',
          course: '',
          year: '',
          faculty: ''
        };
        
        console.log('Staff added:', this.staff);
      } catch (error) {
        await this.showToast('Error adding staff member. Please try again.', 'danger');
        console.error('Error adding staff:', error);
      }
    } else {
      await this.showToast('Please fill in all required fields', 'warning');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.endsWith('.csv')) {
        this.selectedFile = file;
        this.uploadedStudents = []; // Clear previous data
      } else {
        this.showToast('Please select a valid Excel or CSV file', 'danger');
        this.removeFile();
      }
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadedStudents = [];
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async processFile() {
    if (!this.selectedFile) {
      await this.showToast('Please select a file first', 'warning');
      return;
    }

    this.processing = true;
    const loading = await this.loadingController.create({
      message: 'Processing spreadsheet...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = await this.readFile(this.selectedFile);
      console.log('Raw data from file:', data); // Debug log
      
      this.uploadedStudents = this.parseSpreadsheetData(data);
      
      if (this.uploadedStudents.length === 0) {
        console.log('Parsed data:', data); // Additional debug info
        await this.showToast('No valid student data found. Please check your file format and column headers.', 'warning');
        
        // Show available columns for debugging
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log('Available columns:', columns);
          await this.showToast(`Available columns: ${columns.join(', ')}`, 'warning');
        }
      } else {
        await this.showToast(`Successfully loaded ${this.uploadedStudents.length} students`, 'success');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      await this.showToast('Error processing file. Please check the format and try again.', 'danger');
    } finally {
      this.processing = false;
      await loading.dismiss();
    }
  }

  private readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          if (file.name.endsWith('.csv')) {
            // Handle CSV files
            const text = e.target.result;
            const lines = text.split('\n').filter((line: string) => line.trim() !== '');
            
            if (lines.length < 2) {
              reject(new Error('CSV file must have at least a header row and one data row'));
              return;
            }
            
            const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/"/g, ''));
            const data = [];
            
            console.log('CSV Headers:', headers); // Debug
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
                const row: any = {};
                headers.forEach((header: string, index: number) => {
                  row[header] = values[index] || '';
                });
                data.push(row);
              }
            }
            
            console.log('CSV Data:', data); // Debug
            resolve(data);
          } else {
            // Handle Excel files
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Get data with headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              defval: '', // Default value for empty cells
              blankrows: false // Skip blank rows
            });
            
            console.log('Excel raw data:', jsonData); // Debug
            
            if (jsonData.length < 2) {
              reject(new Error('Excel file must have at least a header row and one data row'));
              return;
            }
            
            // Convert to object format
            const headers = (jsonData[0] as string[]).map(h => String(h).toLowerCase().trim());
            const rows = jsonData.slice(1) as any[][];
            
            console.log('Excel Headers:', headers); // Debug
            
            const result = rows
              .filter(row => row && row.some(cell => cell !== undefined && cell !== null && cell !== ''))
              .map(row => {
                const obj: any = {};
                headers.forEach((header, index) => {
                  obj[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';
                });
                return obj;
              });
            
            console.log('Excel processed data:', result); // Debug
            resolve(result);
          }
        } catch (error) {
          console.error('Error reading file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  private parseSpreadsheetData(data: any[]): Student[] {
    const students: Student[] = [];
    
    console.log('Parsing data:', data); // Debug log
    
    for (const row of data) {
      try {
        console.log('Processing row:', row); // Debug each row
        
        // Map various possible column names (more flexible matching)
        const student: Student = {
          surname: this.getFieldValue(row, [
            'surname', 'surname & initials', 'name', 'student name', 
            'full name', 'surname and initials', 'student_name'
          ]),
          phone: this.getFieldValue(row, [
            'phone', 'phone no', 'phone number', 'contact', 
            'mobile', 'cell', 'telephone', 'phone_no'
          ]),
          course: this.getFieldValue(row, [
            'course', 'program', 'degree', 'qualification', 
            'study program', 'course_name'
          ]),
          year: this.getFieldValue(row, [
            'year', 'level', 'year of study', 'academic year', 
            'study year', 'year_of_study'
          ]),
          faculty: this.getFieldValue(row, [
            'faculty', 'school', 'department', 'college', 
            'faculty_name'
          ])
        };
        
        console.log('Parsed student:', student); // Debug parsed student
        
        // More lenient validation - only require surname
        if (student.surname && student.surname.trim() !== '') {
          students.push(student);
          console.log('Added student:', student);
        } else {
          console.log('Skipped row - no surname found:', row);
        }
      } catch (error) {
        console.warn('Error parsing row:', row, error);
      }
    }
    
    console.log('Final students array:', students);
    return students;
  }

  private getFieldValue(row: any, possibleKeys: string[]): string {
    for (const key of possibleKeys) {
      // Try exact match first
      let value = row[key];
      
      // Try lowercase match
      if (!value) {
        value = row[key.toLowerCase()];
      }
      
      // Try uppercase match
      if (!value) {
        value = row[key.toUpperCase()];
      }
      
      // Try with spaces replaced by underscores
      if (!value) {
        value = row[key.replace(/\s+/g, '_')];
      }
      
      // Try without spaces
      if (!value) {
        value = row[key.replace(/\s+/g, '')];
      }
      
      if (value !== undefined && value !== null && value !== '') {
        return String(value).trim();
      }
    }
    return '';
  }

  removeStudent(index: number) {
    this.uploadedStudents.splice(index, 1);
  }

  async saveAllStudents() {
    if (this.uploadedStudents.length === 0) {
      await this.showToast('No students to save', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Save',
      message: `Are you sure you want to save ${this.uploadedStudents.length} students?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async () => {
            await this.processBulkSave();
          }
        }
      ]
    });

    await alert.present();
  }

  private async processBulkSave() {
    const loading = await this.loadingController.create({
      message: 'Saving students...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Here you would typically save to your database
      // For demonstration, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.showToast(`Successfully saved ${this.uploadedStudents.length} students!`, 'success');
      
      // Clear the data after successful save
      this.uploadedStudents = [];
      this.removeFile();
      
    } catch (error) {
      console.error('Error saving students. Please try again.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private isValidStaff(staff: Staff): boolean {
    return !!(staff.surname && staff.phone && staff.course && staff.year && staff.faculty);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
