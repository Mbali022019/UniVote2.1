// vote.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

interface PoliticalParty {
  id: string;
  name: string;
  logo: string;
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
      logo: 'assets/images/parties/effsc-logo.png'
    },
    {
      id: 'sasco',
      name: 'SASCO',
      logo: 'assets/images/parties/sasco-logo.png'
    },
    {
      id: 'sadesmo',
      name: 'SADESMO',
      logo: 'assets/images/parties/sadesmo-logo.png'
    },
    {
      id: 'da',
      name: 'DA',
      logo: 'assets/images/parties/da-logo.png'
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
        this.showMaxCandidatesAlert();
      }
    }
  }

  canSubmitVote(): boolean {
    return this.selectedParty !== null || this.selectedCandidates.length > 0;
  }

  async submitVote() {
    if (!this.canSubmitVote()) {
      await this.showToast('Please make at least one selection before voting.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Your Vote',
      message: this.getConfirmationMessage(),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
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

  private getConfirmationMessage(): string {
    let message = 'You are about to submit your vote for:\n\n';
    
    if (this.selectedParty !== null) {
      message += `Political Party: ${this.politicalParties[this.selectedParty].name}\n`;
    }
    
    if (this.selectedCandidates.length > 0) {
      message += 'Individual Candidates:\n';
      this.selectedCandidates.forEach(index => {
        message += `• ${this.individualCandidates[index].name}\n`;
      });
    }
    
    message += '\nThis action cannot be undone. Are you sure?';
    return message;
  }

  private async processVote() {
    const loading = await this.loadingController.create({
      message: 'Submitting your vote...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const voteData = {
        partyId: this.selectedParty !== null ? this.politicalParties[this.selectedParty].id : null,
        candidateIds: this.selectedCandidates.map(index => this.individualCandidates[index].id),
        timestamp: new Date().toISOString(),
        voterId: 'current-user-id' // Replace with actual user ID
      };

      // Here you would submit to your backend
      // await this.voteService.submitVote(voteData);
      
      console.log('Vote submitted:', voteData);
      
      await loading.dismiss();
      await this.showToast('Your vote has been submitted successfully!', 'success');
      
      // Navigate to confirmation or results page
      this.router.navigate(['/vote-confirmation']);
      
    } catch (error) {
      await loading.dismiss();
      console.error('Error submitting vote:', error);
      await this.showToast('Failed to submit vote. Please try again.', 'danger');
    }
  }

  private async showMaxCandidatesAlert() {
    const alert = await this.alertController.create({
      header: 'Maximum Candidates Selected',
      message: `You can only select a maximum of ${this.maxCandidates} candidates. Please deselect a candidate first.`,
      buttons: ['OK']
    });

    await alert.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      buttons: [
        {
          text: 'Dismiss',
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
        party.logo = `https://via.placeholder.com/48x48/4CAF50/FFFFFF?text=${party.name.charAt(0)}`;
      }
    });

    this.individualCandidates.forEach((candidate, index) => {
      if (!candidate.photo || candidate.photo.includes('assets/')) {
        candidate.photo = `https://via.placeholder.com/48x48/2196F3/FFFFFF?text=${index + 1}`;
      }
    });
  }

  // Method to reset selections (for testing/admin purposes)
  resetSelections() {
    this.selectedParty = null;
    this.selectedCandidates = [];
  }

}
