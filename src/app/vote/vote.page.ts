// vote.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

interface PoliticalParty {
  id: string;
  name: string;
  logo: string;
  logoClass: string;
}

interface IndividualCandidate {
  id: string;
  name: string;
  photo: string;
  party?: string;
}

@Component({
  selector: 'app-vote',
  templateUrl: './vote.page.html',
  styleUrls: ['./vote.page.scss'],
  standalone: false,
})
export class VotePage implements OnInit {

  politicalParties: PoliticalParty[] = [
    {
      id: 'effsc',
      name: 'EFFSC',
      logo: 'assets/images/parties/effsc-logo.png',
      logoClass: 'effsc'
    },
    {
      id: 'sasco',
      name: 'SASCO',
      logo: 'assets/images/parties/sasco-logo.png',
      logoClass: 'sasco'
    },
    {
      id: 'sadesmo',
      name: 'SADESMO',
      logo: 'assets/images/parties/sadesmo-logo.png',
      logoClass: 'sadesmo'
    },
    {
      id: 'da',
      name: 'DA',
      logo: 'assets/images/parties/da-logo.png',
      logoClass: 'da'
    }
  ];

  individualCandidates: IndividualCandidate[] = [
    {
      id: 'candidate1',
      name: 'Candice nzobe EFFSC',
      photo: 'assets/images/candidates/candice.jpg',
      party: 'EFFSC'
    },
    {
      id: 'candidate2',
      name: 'Winnie Poe EFFSC',
      photo: 'assets/images/candidates/winnie.jpg',
      party: 'EFFSC'
    },
    {
      id: 'candidate3',
      name: 'Amahle Mncwa SASCO',
      photo: 'assets/images/candidates/amahle.jpg',
      party: 'SASCO'
    },
    {
      id: 'candidate4',
      name: 'Zine Mhlongo SASCO',
      photo: 'assets/images/candidates/zine.jpg',
      party: 'SASCO'
    },
    {
      id: 'candidate5',
      name: 'Candidate 5',
      photo: 'assets/images/candidates/candidate5.jpg'
    },
    {
      id: 'candidate6',
      name: 'Candidate 6',
      photo: 'assets/images/candidates/candidate6.jpg'
    },
    {
      id: 'candidate7',
      name: 'Candidate 7',
      photo: 'assets/images/candidates/candidate7.jpg'
    },
    {
      id: 'candidate8',
      name: 'Candidate 8',
      photo: 'assets/images/candidates/candidate8.jpg'
    }
  ];

  selectedParty: number | null = null;
  selectedCandidates: number[] = [];
  maxCandidates: number = 2;
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    // Initialize with placeholder images if actual images don't exist
    this.initializePlaceholderImages();
  }

  selectParty(index: number) {
    if (this.selectedParty === index) {
      this.selectedParty = null; // Deselect if already selected
    } else {
      this.selectedParty = index;
    }
  }

  selectCandidate(index: number) {
    const candidateIndex = this.selectedCandidates.indexOf(index);
    
    if (candidateIndex > -1) {
      // Deselect candidate
      this.selectedCandidates.splice(candidateIndex, 1);
    } else {
      // Select candidate (if under limit)
      if (this.selectedCandidates.length < this.maxCandidates) {
        this.selectedCandidates.push(index);
      } else {
        this.showToast(`You can only select a maximum of ${this.maxCandidates} candidates`, 'warning');
      }
    }
  }

  // UPDATED: Now requires a political party to be selected
  canSubmitVote(): boolean {
    return this.selectedParty !== null;
  }

  async submitVote() {
    if (!this.canSubmitVote()) {
      await this.showToast('Please select a political party before voting', 'warning');
      return;
    }

    // Show confirmation dialog
    const alert = await this.alertController.create({
      header: 'Confirm Your Vote',
      message: this.getVoteConfirmationMessage(),
      cssClass: 'glass-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirm Vote',
          handler: () => {
            this.processVote();
          }
        }
      ]
    });

    await alert.present();
  }

  private getVoteConfirmationMessage(): string {
    let message = 'You are about to submit your vote with the following selections:';
    
    if (this.selectedParty !== null) {
      message += ` Political Party: ${this.politicalParties[this.selectedParty].name}.`;
    }
    
    if (this.selectedCandidates.length > 0) {
      message += ` Individual Candidates: `;
      const candidateNames = this.selectedCandidates.map(index => this.individualCandidates[index].name);
      message += candidateNames.join(', ') + '.';
    }
    
    message += ' Once submitted, your vote cannot be changed. Are you sure you want to proceed?';
    
    return message;
  }

  private async processVote() {
    this.isSubmitting = true;

    // Show loading
    const loading = await this.loadingController.create({
      message: 'Submitting your vote...',
      spinner: 'crescent',
      cssClass: 'glass-loading'
    });
    await loading.present();

    try {
      // Create vote data object
      const voteData = {
        partyId: this.selectedParty !== null ? this.politicalParties[this.selectedParty].id : null,
        partyName: this.selectedParty !== null ? this.politicalParties[this.selectedParty].name : null,
        candidateIds: this.selectedCandidates.map(index => this.individualCandidates[index].id),
        candidateNames: this.selectedCandidates.map(index => this.individualCandidates[index].name),
        timestamp: new Date().toISOString(),
        voterId: this.generateVoterId(),
        voteId: this.generateVoteId()
      };

      // Simulate API call to submit vote
      await this.simulateVoteSubmission(voteData);
      
      // Hide loading
      await loading.dismiss();
      
      // Show success message
      await this.showVoteSuccessAlert(voteData.voteId);
      
    } catch (error) {
      // Hide loading
      await loading.dismiss();
      
      // Show error message
      console.error('Error submitting vote:', error);
      await this.showToast('Failed to submit vote. Please try again.', 'danger');
      
    } finally {
      this.isSubmitting = false;
    }
  }

  private simulateVoteSubmission(voteData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Log the vote data for debugging
      console.log('Vote submitted:', voteData);
      
      // Simulate network delay
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 2000);
    });
  }

  private async showVoteSuccessAlert(voteId: string) {
    const alert = await this.alertController.create({
      header: 'Vote Submitted Successfully!',
      message: `Your vote has been recorded! Thank you for participating in the democratic process. Your vote has been securely submitted and will be counted. Vote ID: ${voteId}`,
      cssClass: 'glass-success-alert',
      buttons: [
        {
          text: 'Continue',
          handler: () => {
            this.navigateToResults();
          }
        }
      ]
    });

    await alert.present();
  }

  private generateVoteId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `VOTE-${timestamp}-${randomStr}`.toUpperCase();
  }

  private generateVoterId(): string {
    // In a real app, this would come from user authentication
    return `VOTER-${Date.now().toString(36).toUpperCase()}`;
  }

  private navigateToResults() {
    // Navigate to menu page after successful vote
    this.router.navigate(['/menu']);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      cssClass: 'glass-toast',
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  private initializePlaceholderImages() {
    // Set placeholder images if actual images don't exist
    this.politicalParties.forEach(party => {
      if (!party.logo || party.logo.includes('assets/')) {
        party.logo = `https://via.placeholder.com/56x56/4CAF50/FFFFFF?text=${party.name.charAt(0)}`;
      }
    });

    this.individualCandidates.forEach((candidate, index) => {
      if (!candidate.photo || candidate.photo.includes('assets/')) {
        const initials = candidate.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
        candidate.photo = `https://via.placeholder.com/56x56/2196F3/FFFFFF?text=${initials}`;
      }
    });
  }

  // Additional helper methods
  getSelectedPartyName(): string {
    return this.selectedParty !== null ? this.politicalParties[this.selectedParty].name : '';
  }

  getSelectedCandidateNames(): string[] {
    return this.selectedCandidates.map(index => this.individualCandidates[index].name);
  }

  clearAllSelections() {
    this.selectedParty = null;
    this.selectedCandidates = [];
  }

  // Method to reset selections (for testing/admin purposes)
  resetSelections() {
    this.selectedParty = null;
    this.selectedCandidates = [];
  }

  // Method to handle back button confirmation
  async canLeave(): Promise<boolean> {
    if (this.selectedParty !== null || this.selectedCandidates.length > 0) {
      const alert = await this.alertController.create({
        header: 'Unsaved Changes',
        message: 'You have made selections that haven\'t been submitted. Are you sure you want to leave?',
        cssClass: 'glass-alert',
        buttons: [
          {
            text: 'Stay',
            role: 'cancel'
          },
          {
            text: 'Leave',
            handler: () => {
              return true;
            }
          }
        ]
      });

      await alert.present();
      const result = await alert.onDidDismiss();
      return result.role !== 'cancel';
    }
    return true;
  }

  // Method to get vote summary for confirmation
  getVoteSummary(): any {
    return {
      hasPartySelection: this.selectedParty !== null,
      hasCandidateSelection: this.selectedCandidates.length > 0,
      selectedPartyName: this.getSelectedPartyName(),
      selectedCandidateNames: this.getSelectedCandidateNames(),
      totalSelections: (this.selectedParty !== null ? 1 : 0) + this.selectedCandidates.length
    };
  }

  // UPDATED: Method to validate selections before submission - now requires party selection
  private validateSelections(): boolean {
    // Must select a political party
    if (this.selectedParty === null) {
      return false;
    }
    
    // Check candidate selection limit
    if (this.selectedCandidates.length > this.maxCandidates) {
      return false;
    }
    
    return true;
  }
}