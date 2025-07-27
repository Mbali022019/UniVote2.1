import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { trigger, transition, style, animate } from '@angular/animations';

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
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AdminPage implements OnInit, OnDestroy {
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
  private glassItemListeners: Array<{ element: Element, mouseenter: any, mouseleave: any }> = [];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    console.log('AdminPage initialized'); // Debug log
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.setupGlassEffects();
    }, 500);
  }

  ngOnDestroy() {
    // Clean up event listeners to prevent memory leaks
    this.removeGlassEffects();
  }

  private setupGlassEffects() {
    try {
      const glassItems = document.querySelectorAll('.glass-item');
      console.log('Found glass items:', glassItems.length); // Debug log
      
      glassItems.forEach(item => {
        const hoverHandler = this.onGlassItemHover.bind(this);
        const leaveHandler = this.onGlassItemLeave.bind(this);
        
        item.addEventListener('mouseenter', hoverHandler);
        item.addEventListener('mouseleave', leaveHandler);
        
        // Store listeners for cleanup
        this.glassItemListeners.push({
          element: item,
          mouseenter: hoverHandler,
          mouseleave: leaveHandler
        });
      });
    } catch (error) {
      console.error('Error setting up glass effects:', error);
    }
  }

  private removeGlassEffects() {
    this.glassItemListeners.forEach(({ element, mouseenter, mouseleave }) => {
      element.removeEventListener('mouseenter', mouseenter);
      element.removeEventListener('mouseleave', mouseleave);
    });
    this.glassItemListeners = [];
  }

  private onGlassItemHover(event: Event) {
    try {
      const item = event.target as HTMLElement;
      if (item) {
        item.style.transform = 'translateY(-1px)';
        item.style.boxShadow = '0 8px 32px rgba(0, 229, 255, 0.15)';
      }
    } catch (error) {
      console.error('Error in hover effect:', error);
    }
  }

  private onGlassItemLeave(event: Event) {
    try {
      const item = event.target as HTMLElement;
      if (item) {
        item.style.transform = 'translateY(0)';
        item.style.boxShadow = '';
      }
    } catch (error) {
      console.error('Error in leave effect:', error);
    }
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
    
    // Re-setup glass effects for new elements
    setTimeout(() => {
      this.removeGlassEffects();
      this.setupGlassEffects();
    }, 100);
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
    
    // Re-setup glass effects for new elements
    setTimeout(() => {
      this.removeGlassEffects();
      this.setupGlassEffects();
    }, 100);
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
      cssClass: 'glass-loading',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Generate unique ID for the survey
      this.survey.id = 'survey_' + Date.now();
      
      // Save survey
      await this.saveSurveyToStorage();
      
      await loading.dismiss();
      await this.showSuccessToast('Survey created successfully!');
      
      // Navigate back
      this.router.navigate(['/home']);
      
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
      cssClass: 'glass-loading',
      spinner: 'crescent'
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

  private async saveSurveyToStorage(surveyData?: Survey): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const dataToSave = surveyData || this.survey;
        
        // Get existing surveys from localStorage
        const existingSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
        
        // Add new survey
        existingSurveys.push(dataToSave);
        
        // Save back to localStorage
        localStorage.setItem('surveys', JSON.stringify(existingSurveys));
        
        // Simulate API delay
        setTimeout(() => resolve(), 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top',
      cssClass: 'glass-toast glass-toast-success'
    });
    toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color: 'danger',
      position: 'top',
      cssClass: 'glass-toast glass-toast-error'
    });
    toast.present();
  }

  // Enhanced input interactions
  onInputFocus(event: Event) {
    const input = event.target as HTMLElement;
    const parentItem = input.closest('.glass-item');
    if (parentItem) {
      parentItem.classList.add('glass-focused');
    }
  }

  onInputBlur(event: Event) {
    const input = event.target as HTMLElement;
    const parentItem = input.closest('.glass-item');
    if (parentItem) {
      parentItem.classList.remove('glass-focused');
    }
  }

  onToggleChange(event: any) {
    const toggle = event.target;
    const parentItem = toggle.closest('.glass-toggle-item');
    
    if (parentItem) {
      if (toggle.checked) {
        parentItem.classList.add('glass-toggle-active');
      } else {
        parentItem.classList.remove('glass-toggle-active');
      }
    }
  }
}