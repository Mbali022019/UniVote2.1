import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.page.html',
  styleUrls: ['./polls.page.scss'],
  standalone: false
})
export class PollsPage implements OnInit {
  
  // Search and filter properties
  searchQuery: string = '';
  selectedCategory: string = ''; // Start with no category selected
  isCategoryDropdownOpen: boolean = false;
  
  // Polls data
  polls: any[] = []; // Your poll data will be loaded here
  filteredPolls: any[] = [];
  
  // User's course and faculty information (this should come from user service)
  userCourse = 'IT301'; // User's course
  userFaculty = 'Applied Health & Sciences'; // User's faculty
  
  // Expanded polls tracking
  expandedPolls: Set<string> = new Set();
  
  // User selections and votes
  userSelections: { [pollId: string]: string[] } = {};
  userVotes: Set<string> = new Set();

  constructor() { }

  ngOnInit() {
    this.loadPolls();
  }

  loadPolls() {
    // This should load from your service
    // For now, I'll show the structure your polls should have
    this.polls = [
      {
        id: '1',
        title: 'Best Programming Language for Web Development?',
        description: 'Vote for the programming language you think is best for web development',
        creatorName: 'Dr. Smith',
        creatorAvatar: '',
        createdDate: '2 hours ago',
        totalVotes: 45,
        allowMultiple: false,
        scope: 'course', // 'course', 'faculty', or 'university'
        scopeValue: 'IT301', // The specific course, faculty, or 'university-wide'
        status: 'active',
        options: [
          { id: 'opt1', text: 'JavaScript', votes: 20 },
          { id: 'opt2', text: 'Python', votes: 15 },
          { id: 'opt3', text: 'PHP', votes: 10 }
        ]
      },
      {
        id: '2',
        title: 'Faculty Budget Allocation Priority?',
        description: 'What should be the priority for faculty budget allocation?',
        creatorName: 'Faculty Dean',
        creatorAvatar: '',
        createdDate: '1 day ago',
        totalVotes: 128,
        allowMultiple: true,
        scope: 'faculty',
        scopeValue: 'Applied Health & Sciences',
        status: 'active',
        options: [
          { id: 'opt1', text: 'New Equipment', votes: 45 },
          { id: 'opt2', text: 'Research Funding', votes: 38 },
          { id: 'opt3', text: 'Student Support', votes: 45 }
        ]
      },
      {
        id: '3',
        title: 'University Cafeteria Hours?',
        description: 'Should the university cafeteria extend its operating hours?',
        creatorName: 'Student Council',
        creatorAvatar: '',
        createdDate: '3 days ago',
        totalVotes: 456,
        allowMultiple: false,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Yes, extend to 10 PM', votes: 280 },
          { id: 'opt2', text: 'No, current hours are fine', votes: 176 }
        ]
      },
      {
        id: '4',
        title: 'Campus Wi-Fi Improvement Priority?',
        description: 'Which areas of campus need Wi-Fi improvements most urgently?',
        creatorName: 'IT Services',
        creatorAvatar: '',
        createdDate: '5 hours ago',
        totalVotes: 234,
        allowMultiple: true,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Library', votes: 89 },
          { id: 'opt2', text: 'Student Residence', votes: 67 },
          { id: 'opt3', text: 'Lecture Halls', votes: 78 },
          { id: 'opt4', text: 'Outdoor Areas', votes: 45 }
        ]
      },
      {
        id: '5',
        title: 'Preferred Study Space Type?',
        description: 'What type of study spaces would you like to see more of on campus?',
        creatorName: 'Campus Planning Committee',
        creatorAvatar: '',
        createdDate: '1 day ago',
        totalVotes: 312,
        allowMultiple: false,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Silent Study Rooms', votes: 145 },
          { id: 'opt2', text: 'Group Study Areas', votes: 89 },
          { id: 'opt3', text: 'Outdoor Study Spaces', votes: 78 }
        ]
      },
      {
        id: '6',
        title: 'Campus Transportation Options?',
        description: 'Which transportation option would benefit students most?',
        creatorName: 'Student Affairs',
        creatorAvatar: '',
        createdDate: '2 days ago',
        totalVotes: 189,
        allowMultiple: false,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'More Shuttle Routes', votes: 67 },
          { id: 'opt2', text: 'Bike Rental Program', votes: 45 },
          { id: 'opt3', text: 'Electric Scooter Stations', votes: 77 }
        ]
      },
      {
        id: '7',
        title: 'University Events Preference?',
        description: 'What type of events would you like to see more of on campus?',
        creatorName: 'Events Committee',
        creatorAvatar: '',
        createdDate: '4 days ago',
        totalVotes: 278,
        allowMultiple: true,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Cultural Festivals', votes: 98 },
          { id: 'opt2', text: 'Career Fairs', votes: 87 },
          { id: 'opt3', text: 'Sports Tournaments', votes: 93 },
          { id: 'opt4', text: 'Academic Conferences', votes: 56 }
        ]
      },
      {
        id: '8',
        title: 'Sustainability Initiative Priority?',
        description: 'Which sustainability initiative should the university prioritize?',
        creatorName: 'Green Campus Committee',
        creatorAvatar: '',
        createdDate: '6 hours ago',
        totalVotes: 156,
        allowMultiple: false,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Solar Panel Installation', votes: 67 },
          { id: 'opt2', text: 'Waste Reduction Program', votes: 45 },
          { id: 'opt3', text: 'Campus Recycling Centers', votes: 44 }
        ]
      },
      {
        id: '9',
        title: 'Student Health Services Improvement?',
        description: 'What improvement would most benefit student health services?',
        creatorName: 'Health Center',
        creatorAvatar: '',
        createdDate: '1 day ago',
        totalVotes: 201,
        allowMultiple: false,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Extended Operating Hours', votes: 89 },
          { id: 'opt2', text: 'Mental Health Counseling', votes: 78 },
          { id: 'opt3', text: 'Preventive Care Programs', votes: 34 }
        ]
      },
      {
        id: '10',
        title: 'Campus Security Enhancement?',
        description: 'Which security enhancement would make you feel safer on campus?',
        creatorName: 'Campus Security',
        creatorAvatar: '',
        createdDate: '3 days ago',
        totalVotes: 167,
        allowMultiple: true,
        scope: 'university',
        scopeValue: 'university-wide',
        status: 'active',
        options: [
          { id: 'opt1', text: 'Better Lighting', votes: 78 },
          { id: 'opt2', text: 'Emergency Call Boxes', votes: 56 },
          { id: 'opt3', text: 'More Security Patrols', votes: 67 },
          { id: 'opt4', text: 'CCTV Cameras', votes: 45 }
        ]
      }
    ];
    
    this.filterPolls();
  }

  // Category selection methods
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.isCategoryDropdownOpen = false;
    this.filterPolls();
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  closeCategoryDropdown() {
    this.isCategoryDropdownOpen = false;
  }

  // Get category display information
  getSelectedCategoryName(): string {
    switch (this.selectedCategory) {
      case 'course':
        return `IT Development (${this.userCourse})`;
      case 'faculty':
        return this.userFaculty;
      case 'university':
        return 'University-wide Polls';
      default:
        return 'Select Category';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'course':
        return 'code-slash';
      case 'faculty':
        return 'medical';
      case 'university':
        return 'school';
      default:
        return 'funnel';
    }
  }

  // Filter polls based on selected category and search
  filterPolls() {
    let filtered = [...this.polls];

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(poll => {
        switch (this.selectedCategory) {
          case 'course':
            return poll.scope === 'course' && poll.scopeValue === this.userCourse;
          case 'faculty':
            return poll.scope === 'faculty' && poll.scopeValue === this.userFaculty;
          case 'university':
            return poll.scope === 'university';
          default:
            return false;
        }
      });
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(poll => 
        poll.title.toLowerCase().includes(query) ||
        poll.description.toLowerCase().includes(query) ||
        poll.creatorName.toLowerCase().includes(query)
      );
    }

    this.filteredPolls = filtered;
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    this.filterPolls();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filterPolls();
  }

  // Poll expansion methods
  isExpanded(pollId: string): boolean {
    return this.expandedPolls.has(pollId);
  }

  expandPoll(pollId: string) {
    this.expandedPolls.add(pollId);
  }

  collapsePoll(pollId: string) {
    this.expandedPolls.delete(pollId);
  }

  // Poll interaction methods
  selectOption(pollId: string, optionId: string, allowMultiple: boolean) {
    if (this.hasUserVoted(pollId)) return;

    if (!this.userSelections[pollId]) {
      this.userSelections[pollId] = [];
    }

    if (allowMultiple) {
      const index = this.userSelections[pollId].indexOf(optionId);
      if (index > -1) {
        this.userSelections[pollId].splice(index, 1);
      } else {
        this.userSelections[pollId].push(optionId);
      }
    } else {
      this.userSelections[pollId] = [optionId];
    }
  }

  isOptionSelected(pollId: string, optionId: string): boolean {
    return this.userSelections[pollId]?.includes(optionId) || false;
  }

  hasSelectedOptions(pollId: string): boolean {
    return this.userSelections[pollId]?.length > 0 || false;
  }

  hasUserVoted(pollId: string): boolean {
    return this.userVotes.has(pollId);
  }

  submitVote(poll: any) {
    if (!this.hasSelectedOptions(poll.id)) return;

    // Here you would typically make an API call to submit the vote
    console.log('Submitting vote for poll:', poll.id, 'options:', this.userSelections[poll.id]);
    
    // Mark as voted
    this.userVotes.add(poll.id);
    
    // Update vote counts (this should come from the server response)
    this.updateVoteCounts(poll);
  }

  private updateVoteCounts(poll: any) {
    // This is a simplified version - in real app, this data comes from server
    const selectedOptions = this.userSelections[poll.id];
    selectedOptions.forEach(optionId => {
      const option = poll.options.find((opt: any) => opt.id === optionId);
      if (option) {
        option.votes++;
      }
    });
    poll.totalVotes++;
  }

  // Poll display helper methods
  getPollScopeIcon(poll: any): string {
    switch (poll.scope) {
      case 'course':
        return 'code-slash';
      case 'faculty':
        return 'medical';
      case 'university':
        return 'school';
      default:
        return 'help-circle';
    }
  }

  getPollScopeInfo(poll: any): string {
    switch (poll.scope) {
      case 'course':
        return `Course: ${poll.scopeValue}`;
      case 'faculty':
        return `Faculty: ${poll.scopeValue}`;
      case 'university':
        return 'University-wide';
      default:
        return 'Unknown scope';
    }
  }

  getStatusClass(poll: any): string {
    return `status-${poll.status}`;
  }

  getStatusText(poll: any): string {
    switch (poll.status) {
      case 'active':
        return 'Active';
      case 'closed':
        return 'Closed';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  }

  getVotePercentage(poll: any, optionId: string): number {
    if (poll.totalVotes === 0) return 0;
    const option = poll.options.find((opt: any) => opt.id === optionId);
    return option ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
  }

  trackByPollId(index: number, poll: any): string {
    return poll.id;
  }
}