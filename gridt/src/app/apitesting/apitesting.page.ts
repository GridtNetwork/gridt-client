import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-apitesting',
  templateUrl: './apitesting.page.html',
  styleUrls: ['./apitesting.page.scss'],
})
export class ApitestingPage implements OnInit {
  subscribed_movements = [];
  all_movements = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

  getSubscriptions () {
    this.api.getSubscribedMovements$().subscribe( movements  => {
      this.subscribed_movements = movements;
      console.log(movements);
    });
  }

  getAllMovements () {
    this.api.getAllMovements$().subscribe( movements => {
      this.all_movements = movements;
      console.log(movements);
    });
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
