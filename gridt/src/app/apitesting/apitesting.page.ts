import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { Movement } from '../api/movement.model';

@Component({
  selector: 'app-apitesting',
  templateUrl: './apitesting.page.html',
  styleUrls: ['./apitesting.page.scss'],
})
export class ApitestingPage implements OnInit {
  all_movements: Observable<Movement[]>;
  subscribed_movements: Observable<Movement[]>;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.all_movements = this.api.allMovements$;
    this.subscribed_movements = this.api.subscriptions$;
  }

  getSubscriptions () {
    this.api.getSubscriptions();
  }

  getAllMovements () {
    this.api.getAllMovements();
  }
  subscribe() {
    this.api.subscribeToMovement$(1).subscribe(console.log);
  }

  unsubscribe() {
    this.api.unsubscribeFromMovement$(1).subscribe(console.log);
  }

  update () { 
    this.api.sendUpdate$(1).subscribe(console.log);
  }
  
  swap() {
    this.api.swapLeader$(1, 1).subscribe(console.log);
  }
}
