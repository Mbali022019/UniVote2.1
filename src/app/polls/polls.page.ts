import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  creatorName: string;
  creatorAvatar?: string;
  createdDate: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  allowMultiple: boolean;
  isActive: boolean;
  endDate?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface UserVote {
  pollId: string;
  selectedOptions: string[];
  votedAt: Date;
}

@Component({
  selector: 'app-polls',
  templateUrl: './polls.page.html',
  styleUrls: ['./polls.page.scss'],
  standalone: false,
})
export class PollsPage implements OnInit, OnDestroy {
  polls: Poll[] = [];
  filteredPolls: Poll[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'all';
  expandedPolls: Set<string> = new Set();
  selectedOptions: { [pollId: string]: string[] } = {};
  votedPolls: Set<string> = new Set();
  userVotes: UserVote[] = [];
  isLoading: boolean = false;
  
  private subscriptions: Subscription = new Subscription();

  categories: Category[] = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'general', name: 'General', icon: 'chatbubbles' },
    { id: 'tech', name: 'Technology', icon: 'laptop' },
    { id: 'sports', name: 'Sports', icon: 'football' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'food', name: 'Food & Drink', icon: 'restaurant' },
    { id: 'travel', name: 'Travel', icon: 'airplane' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'heart' },
    { id: 'education', name: 'Education', icon: 'school' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'health', name: 'Health & Fitness', icon: 'fitness' },
    { id: 'politics', name: 'Politics', icon: 'flag' }
  ];

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initializePage();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async initializePage() {
    this.showLoading();
    try {
      await this.loadPolls();
      await this.loadUserVotes();
      this.applyFilters();
    } catch (error) {
      console.error('Error initializing polls page:', error);
      this.showErrorToast('Failed to load polls');
    } finally {
      this.hideLoading();
    }
  }

  async loadPolls() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data - replace with actual API service call
    this.polls = [
      {
        id: '1',
        title: 'What\'s your favorite programming language for 2025?',
        description: 'Help us understand the community preferences for programming languages. This will help shape our upcoming development tutorials and courses.',
        creatorName: 'John Developer',
        creatorAvatar: 'assets/avatars/john.jpg',
        createdDate: '2 hours ago',
        category: 'tech',
        options: [
          { id: '1a', text: 'JavaScript', votes: 45 },
          { id: '1b', text: 'Python', votes: 38 },
          { id: '1c', text: 'TypeScript', votes: 29 },
          { id: '1d', text: 'Java', votes: 22 },
          { id: '1e', text: 'Go', votes: 15 },
          { id: '1f', text: 'Rust', votes: 12 }
        ],
        totalVotes: 161,
        allowMultiple: false,
        isActive: true,
        endDate: '2025-08-15'
      },
      {
        id: '2',
        title: 'Best streaming platforms for entertainment?',
        description: 'Which streaming services do you think offer the best content value? You can select multiple options based on your preferences.',
        creatorName: 'Sarah Movies',
        creatorAvatar: 'assets/avatars/sarah.jpg',
        createdDate: '5 hours ago',
        category: 'entertainment',
        options: [
          { id: '2a', text: 'Netflix', votes: 67 },
          { id: '2b', text: 'Disney+', votes: 45 },
          { id: '2c', text: 'Amazon Prime Video', votes: 38 },
          { id: '2d', text: 'HBO Max', votes: 29 },
          { id: '2e', text: 'Apple TV+', votes: 15 },
          { id: '2f', text: 'Hulu', votes: 12 }
        ],
        totalVotes: 89,
        allowMultiple: true,
        isActive: true,
        endDate: '2025-08-20'
      },
      {
        id: '3',
        title: 'Favorite cuisine type for dinner?',
        description: 'What type of cuisine do you enjoy the most for dinner? This will help local restaurants understand customer preferences.',
        creatorName: 'Chef Mike',
        creatorAvatar: 'assets/avatars/chef.jpg',
        createdDate: '1 day ago',
        category: 'food',
        options: [
          { id: '3a', text: 'Italian', votes: 52 },
          { id: '3b', text: 'Asian (Chinese/Japanese/Thai)', votes: 41 },
          { id: '3c', text: 'Mexican', votes: 35 },
          { id: '3d', text: 'Mediterranean', votes: 28 },
          { id: '3e', text: 'Indian', votes: 22 },
          { id: '3f', text: 'American', votes: 18 }
        ],
        totalVotes: 196,
        allowMultiple: false,
        isActive: true,
        endDate: '2025-08-10'
      },
      {
        id: '4',
        title: 'Remote work preferences post-pandemic?',
        description: 'How do you prefer to work in the current era? Your feedback will help companies make better workplace decisions.',
        creatorName: 'HR Analytics Team',
        createdDate: '2 days ago',
        category: 'business',
        options: [
          { id: '4a', text: 'Fully remote', votes: 78 },
          { id: '4b', text: 'Hybrid (2-3 days office)', votes: 65 },
          { id: '4c', text: 'Hybrid (1-2 days office)', votes: 34 },
          { id: '4d', text: 'Mostly office (4+ days)', votes: 23 },
          { id: '4e', text: 'Fully office-based', votes: 12 }
        ],
        totalVotes: 212,
        allowMultiple: false,
        isActive: true,
        endDate: '2025-08-25'
      },
      {
        id: '5',
        title: 'Essential mobile apps for productivity?',
        description: 'Which mobile apps help you stay most productive during work? Select all that you actively use.',
        creatorName: 'Productivity Guru',
        createdDate: '3 days ago',
        category: 'tech',
        options: [
          { id: '5a', text: 'Notion', votes: 42 },
          { id: '5b', text: 'Todoist', votes: 38 },
          { id: '5c', text: 'Slack', votes: 51 },
          { id: '5d', text: 'Trello', votes: 29 },
          { id: '5e', text: 'Google Workspace', votes: 47 },
          { id: '5f', text: 'Microsoft 365', votes: 33 },
          { id: '5g', text: 'Asana', votes: 21 }
        ],
        totalVotes: 127,
        allowMultiple: true,
        isActive: true,
        endDate: '2025-08-18'
      },
      {
        id: '6',
        title: 'Best workout time of day?',
        description: 'When do you feel most energized for working out? This data will help fitness centers optimize their schedules.',
        creatorName: 'Fitness Coach Lisa',
        createdDate: '4 days ago',
        category: 'health',
        options: [
          { id: '6a', text: 'Early morning (5-7 AM)', votes: 45 },
          { id: '6b', text: 'Morning (7-10 AM)', votes: 38 },
          { id: '6c', text: 'Lunch time (11 AM-2 PM)', votes: 22 },
          { id: '6d', text: 'Afternoon (2-5 PM)', votes: 19 },
          { id: '6e', text: 'Evening (5-8 PM)', votes: 67 },
          { id: '6f', text: 'Night (8-10 PM)', votes: 31 }
        ],
        totalVotes: 222,
        allowMultiple: false,
        isActive: true,
        endDate: '2025-08-12'
      },
      {
        id: '7',
        title: 'Most effective learning methods?',
        description: 'How do you learn new skills most effectively? Multiple selections allowed to understand diverse learning preferences.',
        creatorName: 'Education Research',
        createdDate: '1 week ago',
        category: 'education',
        options: [
          { id: '7a', text: 'Video tutorials', votes: 89 },
          { id: '7b', text: 'Reading books/articles', votes: 56 },
          { id: '7c', text: 'Hands-on practice', votes: 92 },
          { id: '7d', text: 'Online courses', votes: 67 },
          { id: '7e', text: 'Mentorship/coaching', votes: 34 },
          { id: '7f', text: 'Group study/discussion', votes: 28 }
        ],
        totalVotes: 156,
        allowMultiple: true,
        isActive: true,
        endDate: '2025-08-30'
      },
      {
        id: '8',
        title: 'Preferred travel destination type?',
        description: 'What type of destinations do you prefer for vacation? This helps travel agencies plan better packages.',
        creatorName: 'Travel Explorer',
        createdDate: '1 week ago',
        category: 'travel',
        options: [
          { id: '8a', text: 'Beach/coastal areas', votes: 78 },
          { id: '8b', text: 'Mountain/nature spots', votes: 65 },
          { id: '8c', text: 'Historic cities', votes: 43 },
          { id: '8d', text: 'Modern metropolitan areas', votes: 39 },
          { id: '8e', text: 'Adventure/extreme locations', votes: 25 },
          { id: '8f', text: 'Cultural/spiritual places', votes: 31 }
        ],
        totalVotes: 281,
        allowMultiple: false,
        isActive: true,
        endDate: '2025-09-01'
      }
    ];
  }

  async loadUserVotes() {
    // Load user's previous votes from local storage or API
    const savedVotes = localStorage.getItem('pollVotes');
    if (savedVotes) {
      this.userVotes = JSON.parse(savedVotes);
      this.userVotes.forEach(vote => {
        this.votedPolls.add(vote.pollId);
      });
    }
  }

  saveUserVotes() {
    localStorage.setItem('pollVotes', JSON.stringify(this.userVotes));
  }

  // Search and Filter Methods
  onSearchInput(event: any) {
    this.searchQuery = event.target.value.toLowerCase().trim();
    this.applyFilters();
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.polls];

    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(poll => poll.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(poll => 
        poll.title.toLowerCase().includes(this.searchQuery) ||
        poll.description?.toLowerCase().includes(this.searchQuery) ||
        poll.creatorName.toLowerCase().includes(this.searchQuery) ||
        poll.options.some(option => option.text.toLowerCase().includes(this.searchQuery)) ||
        this.getCategoryName(poll.category).toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = this.parseRelativeDate(a.createdDate);
      const dateB = this.parseRelativeDate(b.createdDate);
      return dateB.getTime() - dateA.getTime();
    });

    this.filteredPolls = filtered;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.applyFilters();
  }

  // Category Helper Methods
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.icon : 'help-circle';
  }

  // Poll Expansion Methods
  isExpanded(pollId: string): boolean {
    return this.expandedPolls.has(pollId);
  }

  expandPoll(pollId: string) {
    this.expandedPolls.add(pollId);
    // Track poll view analytics
    this.trackPollView(pollId);
  }

  collapsePoll(pollId: string) {
    this.expandedPolls.delete(pollId);
  }

  // Poll Status Methods
  getStatusClass(poll: Poll): string {
    if (!poll.isActive) return 'inactive';
    return this.hasUserVoted(poll.id) ? 'voted' : 'not-voted';
  }

  getStatusText(poll: Poll): string {
    if (!poll.isActive) return 'Ended';
    return this.hasUserVoted(poll.id) ? 'Voted' : 'Not Voted';
  }

  // Voting Methods
  hasUserVoted(pollId: string): boolean {
    return this.votedPolls.has(pollId);
  }

  isOptionSelected(pollId: string, optionId: string): boolean {
    return this.selectedOptions[pollId]?.includes(optionId) || false;
  }

  hasSelectedOptions(pollId: string): boolean {
    return this.selectedOptions[pollId]?.length > 0 || false;
  }

  selectOption(pollId: string, optionId: string, allowMultiple: boolean) {
    if (this.hasUserVoted(pollId)) return;

    if (!this.selectedOptions[pollId]) {
      this.selectedOptions[pollId] = [];
    }

    const selectedOptions = this.selectedOptions[pollId];
    const isSelected = selectedOptions.includes(optionId);

    if (allowMultiple) {
      if (isSelected) {
        this.selectedOptions[pollId] = selectedOptions.filter(id => id !== optionId);
      } else {
        selectedOptions.push(optionId);
      }
    } else {
      this.selectedOptions[pollId] = isSelected ? [] : [optionId];
    }
  }

  async submitVote(poll: Poll) {
    if (!this.hasSelectedOptions(poll.id) || this.hasUserVoted(poll.id)) {
      return;
    }

    const selectedOptionIds = this.selectedOptions[poll.id];
    
    // Show confirmation dialog for important polls
    if (poll.totalVotes > 100) {
      const shouldSubmit = await this.showVoteConfirmation(poll, selectedOptionIds);
      if (!shouldSubmit) return;
    }

    this.showLoading('Submitting vote...');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark as voted
      this.votedPolls.add(poll.id);

      // Save user vote
      const userVote: UserVote = {
        pollId: poll.id,
        selectedOptions: [...selectedOptionIds],
        votedAt: new Date()
      };
      this.userVotes.push(userVote);
      this.saveUserVotes();

      // Update vote counts locally (in real app, get fresh data from server)
      selectedOptionIds.forEach(optionId => {
        const option = poll.options.find(opt => opt.id === optionId);
        if (option) {
          option.votes++;
          poll.totalVotes++;
        }
      });

      // Clear selections
      delete this.selectedOptions[poll.id];

      this.showSuccessToast('Vote submitted successfully!');
      this.trackVoteSubmission(poll.id, selectedOptionIds);

    } catch (error) {
      console.error('Error submitting vote:', error);
      this.showErrorToast('Failed to submit vote. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  getVotePercentage(poll: Poll, optionId: string): number {
    if (poll.totalVotes === 0) return 0;
    const option = poll.options.find(opt => opt.id === optionId);
    return option ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
  }

  async viewDetailedResults(poll: Poll) {
    // Navigate to detailed results page or show detailed modal
    console.log('Viewing detailed results for poll:', poll.id);
    // this.router.navigate(['/poll-results', poll.id]);
    await this.showDetailedResults(poll);
  }

  // UI Helper Methods
  async showLoading(message: string = 'Loading...') {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      translucent: true
    });
    await loading.present();
  }

  async hideLoading() {
    this.isLoading = false;
    await this.loadingController.dismiss();
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle'
    });
    await toast.present();
  }

  async showVoteConfirmation(poll: Poll, selectedOptions: string[]): Promise<boolean> {
    const optionTexts = selectedOptions.map(id => 
      poll.options.find(opt => opt.id === id)?.text
    ).join(', ');

    const alert = await this.alertController.create({
      header: 'Confirm Vote',
      message: `Are you sure you want to vote for: ${optionTexts}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit Vote',
          role: 'confirm'
        }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }

  async showDetailedResults(poll: Poll) {
    const totalVotes = poll.totalVotes;
    const resultsHTML = poll.options
      .map(option => {
        const percentage = this.getVotePercentage(poll, option.id);
        return `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>${option.text}</span>
              <span>${option.votes} votes (${percentage}%)</span>
            </div>
            <div style="background: rgba(128, 216, 255, 0.2); border-radius: 4px; height: 8px;">
              <div style="background: #80d8ff; height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
            </div>
          </div>
        `;
      })
      .join('');

    const alert = await this.alertController.create({
      header: poll.title,
      message: `
        <div style="margin-bottom: 15px;">
          <strong>Total Votes: ${totalVotes}</strong>
        </div>
        ${resultsHTML}
      `,
      buttons: ['Close']
    });

    await alert.present();
  }

  // Utility Methods
  trackByPollId(index: number, poll: Poll): string {
    return poll.id;
  }

  private parseRelativeDate(dateString: string): Date {
    const now = new Date();
    if (dateString.includes('hour')) {
      const hours = parseInt(dateString);
      return new Date(now.getTime() - (hours * 60 * 60 * 1000));
    } else if (dateString.includes('day')) {
      const days = parseInt(dateString);
      return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    } else if (dateString.includes('week')) {
      const weeks = parseInt(dateString);
      return new Date(now.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000));
    }
    return now;
  }

  private trackPollView(pollId: string) {
    // Analytics tracking
    console.log('Poll viewed:', pollId);
  }

  private trackVoteSubmission(pollId: string, selectedOptions: string[]) {
    // Analytics tracking
    console.log('Vote submitted:', pollId, selectedOptions);
  }

  // Refresh functionality
  async doRefresh(event: any) {
    try {
      await this.loadPolls();
      this.applyFilters();
      this.showSuccessToast('Polls refreshed successfully!');
    } catch (error) {
      this.showErrorToast('Failed to refresh polls');
    } finally {
      event.target.complete();
    }
  }
}