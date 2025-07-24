// results.page.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

interface Candidate {
  name: string;
  votes: number;
  party: string;
  image?: string;
}

interface VotingStats {
  voterRoll: number;
  votesCasted: number;
  notVoted: number;
  votedPercent: number;
  notVotedPercent: number;
}

interface FacultyData {
  name: string;
  votedPercent: number;
  notVotedPercent: number;
  totalVoters: number;
  votedCount: number;
}

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
  standalone: false,
})
export class ResultsPage implements OnInit, AfterViewInit {

  @ViewChild('pieChart', { static: false }) pieChartRef!: ElementRef<HTMLCanvasElement>;

  countdownTime: string = '06:00 hrs';
  
  topCandidates: Candidate[] = [
    {
      name: 'Amahle Mncwa',
      votes: 2498,
      party: 'SASCO',
      image: 'assets/images/candidates/amahle.jpg'
    },
    {
      name: 'Winnie Poe',
      votes: 2134,
      party: 'EFFSC',
      image: 'assets/images/candidates/winnie.jpg'
    }
  ];

  votingStats: VotingStats = {
    voterRoll: 8000,
    votesCasted: 8000,
    notVoted: 8000,
    votedPercent: 30,
    notVotedPercent: 70
  };

  facultyData: FacultyData[] = [
    {
      name: 'Engineering',
      votedPercent: 70,
      notVotedPercent: 30,
      totalVoters: 1200,
      votedCount: 840
    },
    {
      name: 'Natural Sciences',
      votedPercent: 90,
      notVotedPercent: 10,
      totalVoters: 800,
      votedCount: 720
    },
    {
      name: 'Management Science',
      votedPercent: 40,
      notVotedPercent: 60,
      totalVoters: 1000,
      votedCount: 400
    }
  ];

  private countdownInterval: any;

  constructor() { }

  ngOnInit() {
    this.startCountdown();
    this.calculateVotingStats();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.drawPieChart();
    }, 100);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown() {
    // Set initial countdown time (6 hours from now)
    let totalSeconds = 6 * 60 * 60; // 6 hours in seconds
    
    this.countdownInterval = setInterval(() => {
      if (totalSeconds > 0) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        this.countdownTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} hrs`;
        totalSeconds--;
      } else {
        this.countdownTime = '00:00 hrs';
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private calculateVotingStats() {
    // Calculate actual voting statistics
    const totalVoters = this.votingStats.voterRoll;
    const votesCasted = this.facultyData.reduce((sum, faculty) => sum + faculty.votedCount, 0);
    const notVoted = totalVoters - votesCasted;
    
    this.votingStats = {
      voterRoll: totalVoters,
      votesCasted: votesCasted,
      notVoted: notVoted,
      votedPercent: Math.round((votesCasted / totalVoters) * 100),
      notVotedPercent: Math.round((notVoted / totalVoters) * 100)
    };
  }

  private drawPieChart() {
    if (!this.pieChartRef?.nativeElement) return;

    const canvas = this.pieChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 120;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Chart settings
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 45;

    // Data
    const votedPercent = this.votingStats.votedPercent;
    const notVotedPercent = this.votingStats.notVotedPercent;

    // Convert percentages to angles
    const votedAngle = (votedPercent / 100) * 2 * Math.PI;
    const notVotedAngle = (notVotedPercent / 100) * 2 * Math.PI;

    // Draw voted section (blue)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, votedAngle);
    ctx.closePath();
    ctx.fillStyle = '#4A90C2';
    ctx.fill();

    // Draw not voted section (light gray)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, votedAngle, votedAngle + notVotedAngle);
    ctx.closePath();
    ctx.fillStyle = '#E0E0E0';
    ctx.fill();

    // Add border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Method to refresh results (for real-time updates)
  refreshResults() {
    // This would typically fetch fresh data from your backend
    console.log('Refreshing results...');
    // this.resultsService.getLatestResults().subscribe(data => {
    //   this.topCandidates = data.topCandidates;
    //   this.votingStats = data.votingStats;
    //   this.facultyData = data.facultyData;
    //   this.calculateVotingStats();
    //   this.drawPieChart();
    // });
  }

  // Method to export results
  exportResults() {
    const resultsData = {
      timestamp: new Date().toISOString(),
      topCandidates: this.topCandidates,
      votingStats: this.votingStats,
      facultyData: this.facultyData
    };
    
    console.log('Exporting results:', resultsData);
    
    // Create downloadable file
    const dataStr = JSON.stringify(resultsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `voting-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Method to get winner
  getWinner(): Candidate {
    return this.topCandidates.reduce((prev, current) => 
      prev.votes > current.votes ? prev : current
    );
  }

  // Method to calculate total votes
  getTotalVotes(): number {
    return this.topCandidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  }

  // Method to get candidate vote percentage
  getCandidatePercentage(candidate: Candidate): number {
    const totalVotes = this.getTotalVotes();
    return totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
  }

}
