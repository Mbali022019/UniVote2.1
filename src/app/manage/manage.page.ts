import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  isActive: boolean;
  allowMultiple: boolean;
  isAnonymous: boolean;
  votes: number;
  createdDate: string;
}

interface NewPoll {
  title: string;
  description: string;
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
  
  // Stats
  totalPolls: number = 0;
  totalVotes: number = 0;
  activePolls: number = 0;
  
  // Modal state
  showCreateModal: boolean = false;
  
  // New poll form
  newPoll: NewPoll = {
    title: '',
    description: '',
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

  // Load sample polls
  loadPolls() {
    this.polls = [
      {
        id: '1',
        title: 'What should we have for lunch?',
        description: 'Help us decide what to order for the team lunch this Friday.',
        options: [
          { id: '1', text: 'Pizza', votes: 15 },
          { id: '2', text: 'Sushi', votes: 8 },
          { id: '3', text: 'Sandwiches', votes: 12 }
        ],
        isActive: true,
        allowMultiple: false,
        isAnonymous: true,
        votes: 35,
        createdDate: '2 days ago'
      },
      {
        id: '2',
        title: 'Best time for team meeting?',
        description: 'When works best for everyone for our weekly team sync?',
        options: [
          { id: '1', text: 'Monday 9 AM', votes: 22 },
          { id: '2', text: 'Tuesday 2 PM', votes: 18 },
          { id: '3', text: 'Wednesday 10 AM', votes: 25 }
        ],
        isActive: false,
        allowMultiple: true,
        isAnonymous: false,
        votes: 65,
        createdDate: '1 week ago'
      },
      {
        id: '3',
        title: 'Office renovation priorities',
        description: 'What areas should we focus on during the office renovation?',
        options: [
          { id: '1', text: 'Kitchen/Break room', votes: 35 },
          { id: '2', text: 'Meeting rooms', votes: 28 },
          { id: '3', text: 'Open workspace', votes: 20 }
        ],
        isActive: true,
        allowMultiple: true,
        isAnonymous: true,
        votes: 83,
        createdDate: '5 days ago'
      }
    ];
  }

  // Calculate statistics
  calculateStats() {
    this.totalPolls = this.polls.length;
    this.totalVotes = this.polls.reduce((sum, poll) => sum + poll.votes, 0);
    this.activePolls = this.polls.filter(poll => poll.isActive).length;
  }

  // Filter polls based on search and filter criteria
  filterPolls() {
    let filtered = [...this.polls];

    // Apply text search
    if (this.searchText && this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(poll => 
        poll.title.toLowerCase().includes(searchLower) ||
        poll.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.selectedFilter === 'active') {
      filtered = filtered.filter(poll => poll.isActive);
    } else if (this.selectedFilter === 'closed') {
      filtered = filtered.filter(poll => !poll.isActive);
    }

    this.displayedPolls = filtered;
  }

  // Modal methods
  openCreateModal() {
    this.showCreateModal = true;
    this.resetNewPoll();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetNewPoll();
  }

  resetNewPoll() {
    this.newPoll = {
      title: '',
      description: '',
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
    if (this.newPoll.options.length < 6) {
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
    
    const validOptions = this.newPoll.options.filter(opt => opt.text.trim()).length;
    return validOptions >= 2;
  }

  // Create poll
  async createPoll() {
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

    const poll: Poll = {
      id: Date.now().toString(),
      title: this.newPoll.title.trim(),
      description: this.newPoll.description.trim(),
      options: validOptions,
      isActive: true,
      allowMultiple: this.newPoll.allowMultiple,
      isAnonymous: this.newPoll.isAnonymous,
      votes: 0,
      createdDate: 'Just now'
    };

    this.polls.unshift(poll);
    this.calculateStats();
    this.filterPolls();
    this.closeCreateModal();
    
    await this.showToast('Poll created successfully!', 'success');
  }

  // Poll actions
  viewPollResults(poll: Poll) {
    // Navigate to results page or show results
    console.log('Viewing results for:', poll.title);
    this.showToast(`Viewing results for: ${poll.title}`, 'primary');
  }

  editPoll(poll: Poll) {
    // Navigate to edit page or show edit modal
    console.log('Editing poll:', poll.title);
    this.showToast(`Editing: ${poll.title}`, 'primary');
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