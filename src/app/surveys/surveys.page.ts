import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Survey {
  id: string;
  title: string;
  category: string;
  questions: SurveyQuestion[];
  createdDate: Date;
  estimatedTime: number; // in minutes
  responseCount: number;
  isCompleted?: boolean;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
  required: boolean;
}

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.page.html',
  styleUrls: ['./surveys.page.scss'],
  standalone: false,
})
export class SurveysPage implements OnInit {

  surveys: Survey[] = [];
  filteredSurveys: Survey[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = true;

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'customer-feedback', label: 'Customer Feedback' },
    { value: 'employee-satisfaction', label: 'Employee Satisfaction' },
    { value: 'product-research', label: 'Product Research' },
    { value: 'market-analysis', label: 'Market Analysis' },
    { value: 'event-feedback', label: 'Event Feedback' }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadSurveys();
  }

  loadSurveys() {
    // Simulate API call
    setTimeout(() => {
      this.surveys = this.generateMockSurveys();
      this.filteredSurveys = [...this.surveys];
      this.isLoading = false;
    }, 1500);
  }

  generateMockSurveys(): Survey[] {
    return [
      {
        id: '1',
        title: 'Customer Satisfaction Survey 2024',
        category: 'customer-feedback',
        createdDate: new Date('2024-01-15'),
        estimatedTime: 5,
        responseCount: 234,
        questions: [
          {
            id: 'q1',
            question: 'How satisfied are you with our service?',
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
            allowMultiple: false,
            required: true
          },
          {
            id: 'q2',
            question: 'What features would you like to see improved?',
            options: ['User Interface', 'Performance', 'Customer Support', 'Pricing', 'Documentation'],
            allowMultiple: true,
            required: false
          }
        ]
      },
      {
        id: '2',
        title: 'Employee Work Environment Assessment',
        category: 'employee-satisfaction',
        createdDate: new Date('2024-02-01'),
        estimatedTime: 8,
        responseCount: 89,
        questions: [
          {
            id: 'q1',
            question: 'How would you rate your work-life balance?',
            options: ['Excellent', 'Good', 'Fair', 'Poor'],
            allowMultiple: false,
            required: true
          }
        ]
      },
      {
        id: '3',
        title: 'New Product Feature Feedback',
        category: 'product-research',
        createdDate: new Date('2024-02-10'),
        estimatedTime: 3,
        responseCount: 156,
        isCompleted: true,
        questions: [
          {
            id: 'q1',
            question: 'Which new feature interests you most?',
            options: ['Dark Mode', 'Advanced Analytics', 'Mobile App', 'API Integration'],
            allowMultiple: false,
            required: true
          }
        ]
      },
      {
        id: '4',
        title: 'Market Trends Analysis Q1 2024',
        category: 'market-analysis',
        createdDate: new Date('2024-01-20'),
        estimatedTime: 12,
        responseCount: 67,
        questions: [
          {
            id: 'q1',
            question: 'What industry trends concern you most?',
            options: ['AI Adoption', 'Remote Work', 'Sustainability', 'Digital Transformation'],
            allowMultiple: true,
            required: true
          }
        ]
      },
      {
        id: '5',
        title: 'Conference 2024 Feedback',
        category: 'event-feedback',
        createdDate: new Date('2024-02-15'),
        estimatedTime: 4,
        responseCount: 312,
        questions: [
          {
            id: 'q1',
            question: 'How was the overall conference experience?',
            options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
            allowMultiple: false,
            required: true
          }
        ]
      }
    ];
  }

  filterSurveys() {
    this.filteredSurveys = this.surveys.filter(survey => {
      const matchesCategory = this.selectedCategory === 'all' || survey.category === this.selectedCategory;
      const matchesSearch = survey.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  onCategoryChange() {
    this.filterSurveys();
  }

  onSearchChange() {
    this.filterSurveys();
  }

  takeSurvey(survey: Survey) {
    if (survey.isCompleted) {
      return; // Don't allow taking completed surveys
    }
    // Navigate to survey taking page
    this.router.navigate(['/take-survey', survey.id]);
  }

  getCategoryLabel(categoryValue: string): string {
    const category = this.categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'customer-feedback': 'primary',
      'employee-satisfaction': 'secondary',
      'product-research': 'tertiary',
      'market-analysis': 'success',
      'event-feedback': 'warning'
    };
    return colors[category] || 'medium';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  refreshSurveys(event: any) {
    this.loadSurveys();
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
