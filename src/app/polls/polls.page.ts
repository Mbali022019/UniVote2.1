// polls.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface PollOption {
  text: string;
  votes: number;
  selected?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  totalVotes: number;
}

@Component({
  selector: 'app-polls',
  templateUrl: './polls.page.html',
  styleUrls: ['./polls.page.scss'],
  standalone: false,
})
export class PollsPage implements OnInit {

  pollData: Poll = {
    id: '1',
    question: 'Who do you vote for to be the IT class representative in 2025?',
    allowMultiple: false,
    totalVotes: 0,
    options: [
      { text: 'Mbali Ngwadla', votes: 0 },
      { text: 'Lilita Mhle', votes: 0 },
      { text: 'Amahle Mncwango', votes: 0 },
      { text: 'Esona Zungula', votes: 0 },
      { text: 'Qiniso Mtshali', votes: 0 }
    ]
  };

  selectedOption: number | null = null;
  selectedOptions: number[] = [];
  hasVoted: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.calculateTotalVotes();
  }

  selectOption(index: number) {
    if (this.hasVoted) return;

    if (this.pollData.allowMultiple) {
      // Handle multiple selection
      const optionIndex = this.selectedOptions.indexOf(index);
      if (optionIndex > -1) {
        this.selectedOptions.splice(optionIndex, 1);
        this.pollData.options[index].selected = false;
      } else {
        this.selectedOptions.push(index);
        this.pollData.options[index].selected = true;
      }
    } else {
      // Handle single selection
      this.selectedOption = index;
      this.selectedOptions = [index];
    }
  }

  canVote(): boolean {
    if (this.pollData.allowMultiple) {
      return this.selectedOptions.length > 0;
    } else {
      return this.selectedOption !== null;
    }
  }

  submitVote() {
    if (!this.canVote() || this.hasVoted) return;

    // Update vote counts
    this.selectedOptions.forEach(index => {
      this.pollData.options[index].votes++;
    });

    this.calculateTotalVotes();
    this.hasVoted = true;

    // Here you would typically send the vote to your backend
    console.log('Vote submitted:', {
      pollId: this.pollData.id,
      selectedOptions: this.selectedOptions
    });

    // Optional: Show success message
    // this.showToast('Vote submitted successfully!');
  }

  calculateTotalVotes() {
    this.pollData.totalVotes = this.pollData.options.reduce(
      (total, option) => total + option.votes, 0
    );
  }

  getVotePercentage(votes: number): number {
    if (this.pollData.totalVotes === 0) return 0;
    return (votes / this.pollData.totalVotes) * 100;
  }

  viewVotes() {
    // Navigate to detailed vote results page
    this.router.navigate(['/poll-results', this.pollData.id]);
  }

  // Method to load poll data (you would call this with actual poll ID)
  loadPollData(pollId: string) {
    // This would typically fetch data from your service
    // this.pollService.getPoll(pollId).subscribe(poll => {
    //   this.pollData = poll;
    //   this.calculateTotalVotes();
    // });
  }

  // Method to check if user has already voted (from backend)
  checkUserVoteStatus() {
    // This would check if current user has already voted on this poll
    // this.pollService.hasUserVoted(this.pollData.id).subscribe(hasVoted => {
    //   this.hasVoted = hasVoted;
    // });
  }

}
