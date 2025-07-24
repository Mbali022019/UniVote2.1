// menu.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false,
})
export class MenuPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  // Navigation methods for top tabs
  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

  // Navigation methods for menu cards
  goToVote() {
    this.router.navigate(['/vote']);
  }

  goToSurveys() {
    this.router.navigate(['/surveys']);
  }

  goToResults() {
    this.router.navigate(['/results']);
  }

  goToPolls() {
    this.router.navigate(['/polls']);
  }

}
