// manage.page.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  styleUrls: ['./manage.page.scss'],
  standalone: false,
})
export class ManagePage implements OnInit {

  // Properties that your HTML template needs
  question: string = '';
  options = [
    { text: '' },
    { text: '' }
  ];
  allowMultiple: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  // Methods that your HTML template calls
  addOption() {
    if (this.options.length < 5) {
      this.options.push({ text: '' });
    }
  }

  removeOption(index: number) {
    if (this.options.length > 2) {
      this.options.splice(index, 1);
    }
  }

  isValid(): boolean {
    if (!this.question.trim()) return false;
    
    const validOptions = this.options.filter(opt => opt.text.trim());
    return validOptions.length >= 2;
  }

  createPoll() {
    if (!this.isValid()) return;
    
    const pollData = {
      question: this.question.trim(),
      options: this.options.filter(opt => opt.text.trim()),
      allowMultiple: this.allowMultiple,
      createdAt: new Date()
    };
    
    console.log('Creating poll:', pollData);
    // Add your poll creation logic here
    // For example: this.pollService.createPoll(pollData);
  }

}