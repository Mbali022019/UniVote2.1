import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

interface Question {
  text: string;
  type: 'multiple-choice' | 'text' | 'rating' | 'yes-no';
  options: string[];
  allowMultiple: boolean;
  required: boolean;
  ratingScale: '1-5' | '1-10';
}

interface Survey {
  id?: string;
  title: string;
  category: string;
  estimatedTime: number;
  questions: Question[];
  allowAnonymous: boolean;
  isActive: boolean;
  endDate?: string;
  createdDate: string;
  responseCount: number;
  isCompleted: boolean;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage implements OnInit {
  survey: Survey = {
    title: '',
    category: '',
    estimatedTime: 5,
    questions: [
      {
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        allowMultiple: false,
        required: true,
        ratingScale: '1-5'
      }
    ],
    allowAnonymous: true,
    isActive: true,
    createdDate: new Date().toISOString(),
    responseCount: 0,
    isCompleted: false
  };

  isSubmitting = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    // Initialize with default question
  }

  addQuestion() {
    const newQuestion: Question = {
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      allowMultiple: false,
      required: true,
      ratingScale: '1-5'
    };
    this.survey.questions.push(newQuestion);
  }

  removeQuestion(index: number) {
    if (this.survey.questions.length > 1) {
      this.survey.questions.splice(index, 1);
    }
  }

  onQuestionTypeChange(questionIndex: number) {
    const question = this.survey.questions[questionIndex];
    
    // Reset options based on question type
    switch (question.type) {
      case 'multiple-choice':
        question.options = ['', ''];
        break;
      case 'yes-no':
        question.options = ['Yes', 'No'];
        question.allowMultiple = false;
        break;
      case 'text':
      case 'rating':
        question.options = [];
        question.allowMultiple = false;
        break;
    }
  }

  addOption(questionIndex: number) {
    this.survey.questions[questionIndex].options.push('');
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const question = this.survey.questions[questionIndex];
    if (question.options.length > 2) {
      question.options.splice(optionIndex, 1);
    }
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async createSurvey() {
    if (!this.validateSurvey()) {
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: 'Creating survey...',
    });
    await loading.present();

    try {
      // Generate unique ID for the survey
      this.survey.id = 'survey_' + Date.now();
      
      // Here you would typically save to your backend/database
      await this.saveSurveyToStorage();
      
      await loading.dismiss();
      await this.showSuccessToast('Survey created successfully!');
      
      // Navigate back to home or surveys list
      this.router.navigate(['/surveys']);
      
    } catch (error) {
      await loading.dismiss();
      await this.showErrorToast('Failed to create survey. Please try again.');
      console.error('Error creating survey:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async saveDraft() {
    const loading = await this.loadingController.create({
      message: 'Saving draft...',
    });
    await loading.present();

    try {
      // Save as draft (inactive survey)
      const draftSurvey = { ...this.survey, isActive: false };
      draftSurvey.id = 'draft_' + Date.now();
      
      await this.saveSurveyToStorage(draftSurvey);
      
      await loading.dismiss();
      await this.showSuccessToast('Draft saved successfully!');
      
    } catch (error) {
      await loading.dismiss();
      await this.showErrorToast('Failed to save draft.');
      console.error('Error saving draft:', error);
    }
  }

  private validateSurvey(): boolean {
    // Validate survey title
    if (!this.survey.title.trim()) {
      this.showErrorToast('Please enter a survey title.');
      return false;
    }

    // Validate category
    if (!this.survey.category) {
      this.showErrorToast('Please select a category.');
      return false;
    }

    // Validate questions
    for (let i = 0; i < this.survey.questions.length; i++) {
      const question = this.survey.questions[i];
      
      if (!question.text.trim()) {
        this.showErrorToast(`Please enter text for question ${i + 1}.`);
        return false;
      }

      if (question.type === 'multiple-choice') {
        const validOptions = question.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          this.showErrorToast(`Question ${i + 1} must have at least 2 options.`);
          return false;
        }
      }
    }

    return true;
  }

  private async saveSurveyToStorage(surveyData?: Survey) {
    // This is a mock implementation. In a real app, you'd save to your backend
    const dataToSave = surveyData || this.survey;
    
    // Get existing surveys from localStorage
    const existingSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    
    // Add new survey
    existingSurveys.push(dataToSave);
    
    // Save back to localStorage
    localStorage.setItem('surveys', JSON.stringify(existingSurveys));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  async showDiscardAlert() {
    const alert = await this.alertController.create({
      header: 'Discard Changes?',
      message: 'Are you sure you want to discard all changes?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Discard',
          role: 'destructive',
          handler: () => {
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }
}
