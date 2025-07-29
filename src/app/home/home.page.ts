import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private modalController: ModalController) {}

  async openLearnMoreModal() {
    console.log('Learn More button clicked!');

    try {
      const modal = await this.modalController.create({
        component: LearnMoreModalComponent,
        cssClass: 'learn-more-modal',
        backdropDismiss: true
      });

      return await modal.present();
    } catch (error) {
      console.error('Error creating modal:', error);
    }
  }
}

@Component({
  selector: 'app-learn-more-modal',
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Learn More About UniVote</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="learn-more-content">
      <div class="content-wrapper">

        <!-- Section 1: What is UniVote? -->
        <div class="section">
          <div class="section-header">
            <ion-icon name="school-outline" class="section-icon"></ion-icon>
            <h2>What is UniVote?</h2>
          </div>
          <div class="section-content">
            <p><strong>UniVote</strong> is a digital voting platform designed for student elections.</p>
            <ul>
              <li>Register with your student credentials</li>
              <li>Browse candidates and their platforms</li>
              <li>Vote securely</li>
              <li>See results in real-time</li>
            </ul>
          </div>
        </div>

        <!-- Section 2: Key Features -->
        <div class="section">
          <div class="section-header">
            <ion-icon name="extension-puzzle-outline" class="section-icon"></ion-icon>
            <h2>Key Features</h2>
          </div>
          <div class="section-content feature-grid">
            <div class="feature-item">
              <ion-icon name="shield-checkmark-outline"></ion-icon>
              <h4>2FA Login</h4>
              <p>Secure access for verified students.</p>
            </div>
            <div class="feature-item">
              <ion-icon name="pulse-outline"></ion-icon>
              <h4>Live Results</h4>
              <p>Watch results update in real-time.</p>
            </div>
            <div class="feature-item">
              <ion-icon name="people-outline"></ion-icon>
              <h4>Candidate Info</h4>
              <p>Get to know who you're voting for.</p>
            </div>
            <div class="feature-item">
              <ion-icon name="accessibility-outline"></ion-icon>
              <h4>Accessibility</h4>
              <p>Inclusive for all users.</p>
            </div>
          </div>
        </div>

        <!-- Section 3: Impact -->
        <div class="section">
          <div class="section-header">
            <ion-icon name="trending-up-outline" class="section-icon"></ion-icon>
            <h2>Proven Impact</h2>
          </div>
          <div class="section-content stats-grid">
            <div class="stat-item">
              <h3>20%</h3>
              <p>More voter turnout</p>
            </div>
            <div class="stat-item">
              <h3>50+</h3>
              <p>Universities use UniVote</p>
            </div>
            <div class="stat-item">
              <h3>2 min</h3>
              <p>To cast a vote</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="section cta-section">
          <div class="section-header">
            <ion-icon name="checkmark-circle-outline" class="section-icon"></ion-icon>
            <h2>Ready to Vote?</h2>
          </div>
          <div class="section-content">
            <p>Join thousands of students already using UniVote.</p>
            <div class="cta-buttons">
              <ion-button expand="block" class="primary-button" (click)="dismiss()" routerLink="/login">
                <ion-icon name="log-in-outline" slot="start"></ion-icon>
                Get Started
              </ion-button>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .learn-more-content {
      --background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      color: #e0f7fa;
    }

    .content-wrapper {
      padding: 32px;
      max-width: 1000px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section {
      margin-bottom: 30px;
      padding: 24px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    }

    .section-header h2 {
      margin: 0;
      font-size: 22px;
      color: #80d8ff;
    }

    .section-icon {
      color: #00e5ff;
      font-size: 26px;
    }

    .section-content {
      margin-top: 12px;
      font-size: 15px;
    }

    ul {
      padding-left: 20px;
    }

    .feature-grid, .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .feature-item, .stat-item {
      text-align: center;
      background: rgba(0, 191, 255, 0.08);
      padding: 16px;
      border-radius: 10px;
    }

    .feature-item ion-icon, .stat-item h3 {
      color: #00e5ff;
      font-size: 26px;
      margin-bottom: 10px;
    }

    .feature-item h4 {
      color: #b3e5fc;
      margin: 6px 0;
    }

    .feature-item p {
      color: #bbdefb;
      font-size: 13px;
    }

    .stat-item h3 {
      font-size: 28px;
      font-weight: bold;
    }

    .stat-item p {
      color: #bbdefb;
      font-size: 13px;
    }

    .cta-section {
      background: linear-gradient(135deg, #00bcd4, #0097a7);
      color: white;
      padding: 24px;
      border-radius: 12px;
    }

    .cta-buttons ion-button {
      --background: white;
      --color: #00bcd4;
      font-weight: bold;
      --border-radius: 12px;
    }

    @media (max-width: 768px) {
      .content-wrapper {
        padding: 24px;
      }

      .feature-grid, .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  standalone: false
})
export class LearnMoreModalComponent {
  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}

