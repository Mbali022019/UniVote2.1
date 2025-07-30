import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Voter {
  id: string;
  name: string;
  studentId: string;
  course: string;
  avatar?: string;
  selectedOptions: string[];
  votedAt: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  categoryType: 'University-wide' | 'Faculty' | 'Course';
  category: string;
  options: PollOption[];
  isActive: boolean;
  allowMultiple: boolean;
  isAnonymous: boolean;
  votes: number;
  createdDate: string;
  voters?: Voter[];
}

interface NewPoll {
  title: string;
  description: string;
  categoryType: 'University-wide' | 'Faculty' | 'Course';
  category: string;
  options: { text: string }[];
  allowMultiple: boolean;
  isAnonymous: boolean;
}

@Component({
  selector: 'app-manage',
  templateUrl: './manage.page.html',
  styleUrls: ['./manage.page.scss'],
  standalone: false
})
export class ManagePage implements OnInit {

  // Data properties
  polls: Poll[] = [];
  displayedPolls: Poll[] = [];
  
  // Filter and search
  searchText: string = '';
  selectedFilter: string = 'all';
  selectedCategory: string = '';
  
  // Stats
  totalPolls: number = 0;
  totalVotes: number = 0;
  activePolls: number = 0;
  
  // Modal state
  showCreateModal: boolean = false;
  showResultsModal: boolean = false;
  editingPoll: Poll | null = null;
  selectedPollForResults: Poll | null = null;
  
  // Categories
  faculties: string[] = [
    'Faculty of Science',
    'Faculty of Medicine',
    'Faculty of Law',
    'Faculty of Engineering',
    'Faculty of Arts',
    'Faculty of Business',
    'Faculty of Education'
  ];

  courses: string[] = [
    'Computer Science',
    'Information Technology',
    'Dentistry',
    'Optometry',
    'Nursing',
    'Pharmacy',
    'Accounting',
    'Marketing',
    'Psychology',
    'Economics'
  ];
  
  // New poll form
  newPoll: NewPoll = {
    title: '',
    description: '',
    categoryType: 'University-wide',
    category: 'All Students',
    options: [
      { text: '' },
      { text: '' }
    ],
    allowMultiple: false,
    isAnonymous: true
  };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadPolls();
    this.calculateStats();
    this.filterPolls();
  }

  // Load sample polls with enhanced data
  loadPolls() {
    this.polls = [
      {
        id: '1',
        title: 'Campus Food Court Preferences',
        description: 'Help us decide what new food outlets to add to the main campus food court.',
        categoryType: 'University-wide',
        category: 'All Students',
        options: [
          { id: '1', text: 'Asian Cuisine', votes: 145 },
          { id: '2', text: 'Mexican Food', votes: 98 },
          { id: '3', text: 'Healthy Salads', votes: 127 },
          { id: '4', text: 'Pizza Corner', votes: 156 }
        ],
        isActive: true,
        allowMultiple: true,
        isAnonymous: true,
        votes: 526,
        createdDate: '2 days ago',
        voters: []
      },
      {
        id: '2',
        title: 'Best Time for CS Department Seminars',
        description: 'When works best for Computer Science students for weekly technical seminars?',
        categoryType: 'Course',
        category: 'Computer Science',
        options: [
          { id: '1', text: 'Monday 2 PM', votes: 22 },
          { id: '2', text: 'Wednesday 4 PM', votes: 35 },
          { id: '3', text: 'Friday 10 AM', votes: 18 }
        ],
        isActive: false,
        allowMultiple: false,
        isAnonymous: false,
        votes: 75,
        createdDate: '1 week ago',
        voters: [
          {
            id: '1',
            name: 'John Smith',
            studentId: 'CS2021001',
            course: 'Computer Science',
            selectedOptions: ['Wednesday 4 PM'],
            votedAt: '3 days ago'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            studentId: 'CS2021002',
            course: 'Computer Science',
            selectedOptions: ['Wednesday 4 PM'],
            votedAt: '4 days ago'
          }
        ]
      },
      {
        id: '3',
        title: 'Science Faculty Library Hours',
        description: 'What are your preferred extended library hours during exam season?',
        categoryType: 'Faculty',
        category: 'Faculty of Science',
        options: [
          { id: '1', text: '24/7 Access', votes: 89 },
          { id: '2', text: 'Until 2 AM', votes: 156 },
          { id: '3', text: 'Until Midnight', votes: 67 }
        ],
        isActive: true,
        allowMultiple: false,
        isAnonymous: true,
        votes: 312,
        createdDate: '5 days ago',
        voters: []
      },
      {
        id: '4',
        title: 'IT Lab Software Preferences',
        description: 'Which development tools should we prioritize for the new IT labs?',
        categoryType: 'Course',
        category: 'Information Technology',
        options: [
          { id: '1', text: 'Visual Studio Code', votes: 45 },
          { id: '2', text: 'IntelliJ IDEA', votes: 32 },
          { id: '3', text: 'Eclipse IDE', votes: 18 },
          { id: '4', text: 'PyCharm', votes: 28 }
        ],
        isActive: true,
        allowMultiple: true,
        isAnonymous: false,
        votes: 123,
        createdDate: '1 day ago',
        voters: []
      }
    ];
  }

  // Calculate statistics
  calculateStats() {
    this.totalPolls = this.polls.length;
    this.totalVotes = this.polls.reduce((sum, poll) => sum + poll.votes, 0);
    this.activePolls = this.polls.filter(poll => poll.isActive).length;
  }

  // Get available categories based on current filter
  getAvailableCategories(): string[] {
    if (this.selectedFilter === 'faculty') {
      return [...new Set(this.polls
        .filter(poll => poll.categoryType === 'Faculty')
        .map(poll => poll.category))];
    } else if (this.selectedFilter === 'course') {
      return [...new Set(this.polls
        .filter(poll => poll.categoryType === 'Course')
        .map(poll => poll.category))];
    }
    return [];
  }

  // Get category color for badges
  getCategoryColor(categoryType: string): string {
    switch (categoryType) {
      case 'University-wide': return 'primary';
      case 'Faculty': return 'secondary';
      case 'Course': return 'tertiary';
      default: return 'medium';
    }
  }

  // Filter polls based on search and filter criteria
  filterPolls() {
    let filtered = [...this.polls];

    // Apply text search
    if (this.searchText && this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(poll => 
        poll.title.toLowerCase().includes(searchLower) ||
        poll.description.toLowerCase().includes(searchLower) ||
        poll.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply status and category filters
    if (this.selectedFilter === 'active') {
      filtered = filtered.filter(poll => poll.isActive);
    } else if (this.selectedFilter === 'closed') {
      filtered = filtered.filter(poll => !poll.isActive);
    } else if (this.selectedFilter === 'university-wide') {
      filtered = filtered.filter(poll => poll.categoryType === 'University-wide');
    } else if (this.selectedFilter === 'faculty') {
      filtered = filtered.filter(poll => poll.categoryType === 'Faculty');
      if (this.selectedCategory) {
        filtered = filtered.filter(poll => poll.category === this.selectedCategory);
      }
    } else if (this.selectedFilter === 'course') {
      filtered = filtered.filter(poll => poll.categoryType === 'Course');
      if (this.selectedCategory) {
        filtered = filtered.filter(poll => poll.category === this.selectedCategory);
      }
    }

    this.displayedPolls = filtered;
  }

  // Modal methods
  openCreateModal() {
    this.editingPoll = null;
    this.showCreateModal = true;
    this.resetNewPoll();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.editingPoll = null;
    this.resetNewPoll();
  }

  openResultsModal(poll: Poll) {
    this.selectedPollForResults = poll;
    this.showResultsModal = true;
  }

  closeResultsModal() {
    this.showResultsModal = false;
    this.selectedPollForResults = null;
  }

  resetNewPoll() {
    this.newPoll = {
      title: '',
      description: '',
      categoryType: 'University-wide',
      category: 'All Students',
      options: [
        { text: '' },
        { text: '' }
      ],
      allowMultiple: false,
      isAnonymous: true
    };
  }

  // Option management
  addOption() {
    if (this.newPoll.options.length < 10) {
      this.newPoll.options.push({ text: '' });
    }
  }

  removeOption(index: number) {
    if (this.newPoll.options.length > 2) {
      this.newPoll.options.splice(index, 1);
    }
  }

  // Validation
  canCreatePoll(): boolean {
    if (!this.newPoll.title.trim()) return false;
    
    // Check category selection
    if (this.newPoll.categoryType === 'Faculty' && !this.newPoll.category) return false;
    if (this.newPoll.categoryType === 'Course' && !this.newPoll.category) return false;
    
    const validOptions = this.newPoll.options.filter(opt => opt.text.trim()).length;
    return validOptions >= 2;
  }

  // Save poll (create or update)
  async savePoll() {
    if (!this.canCreatePoll()) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const validOptions = this.newPoll.options
      .filter(opt => opt.text.trim())
      .map((opt, index) => ({
        id: (index + 1).toString(),
        text: opt.text.trim(),
        votes: 0
      }));

    // Set category based on type
    let category = this.newPoll.category;
    if (this.newPoll.categoryType === 'University-wide') {
      category = 'All Students';
    }

    if (this.editingPoll) {
      // Update existing poll
      const pollIndex = this.polls.findIndex(p => p.id === this.editingPoll!.id);
      if (pollIndex !== -1) {
        this.polls[pollIndex] = {
          ...this.polls[pollIndex],
          title: this.newPoll.title.trim(),
          description: this.newPoll.description.trim(),
          categoryType: this.newPoll.categoryType,
          category: category,
          options: validOptions,
          allowMultiple: this.newPoll.allowMultiple,
          isAnonymous: this.newPoll.isAnonymous
        };
        await this.showToast('Poll updated successfully!', 'success');
      }
    } else {
      // Create new poll
      const poll: Poll = {
        id: Date.now().toString(),
        title: this.newPoll.title.trim(),
        description: this.newPoll.description.trim(),
        categoryType: this.newPoll.categoryType,
        category: category,
        options: validOptions,
        isActive: true,
        allowMultiple: this.newPoll.allowMultiple,
        isAnonymous: this.newPoll.isAnonymous,
        votes: 0,
        createdDate: 'Just now',
        voters: this.newPoll.isAnonymous ? undefined : []
      };

      this.polls.unshift(poll);
      await this.showToast('Poll created successfully!', 'success');
    }

    this.calculateStats();
    this.filterPolls();
    this.closeCreateModal();
  }

  // Poll actions
  viewPollResults(poll: Poll) {
    this.openResultsModal(poll);
  }

  editPoll(poll: Poll) {
    this.editingPoll = poll;
    this.newPoll = {
      title: poll.title,
      description: poll.description,
      categoryType: poll.categoryType,
      category: poll.category,
      options: poll.options.map(opt => ({ text: opt.text })),
      allowMultiple: poll.allowMultiple,
      isAnonymous: poll.isAnonymous
    };
    this.showCreateModal = true;
  }

  async togglePollStatus(poll: Poll) {
    const action = poll.isActive ? 'close' : 'activate';
    const alert = await this.alertController.create({
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Poll`,
      message: `Are you sure you want to ${action} this poll?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: () => {
            poll.isActive = !poll.isActive;
            this.calculateStats();
            this.filterPolls();
            this.showToast(`Poll ${action}d successfully`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePoll(pollId: string) {
    const alert = await this.alertController.create({
      header: 'Delete Poll',
      message: 'Are you sure you want to delete this poll? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.polls = this.polls.filter(poll => poll.id !== pollId);
            this.calculateStats();
            this.filterPolls();
            this.showToast('Poll deleted successfully', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  // Results helper methods
  getVotePercentage(votes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  }

  // Utility methods
  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}