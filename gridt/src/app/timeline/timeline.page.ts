import { Component, OnInit } from '@angular/core';
import { movements } from '../mockmovements'

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  get filterBySubscribed() {
    return movements.filter(movement => movement.subscribed);
  }

  public movements = movements;

}
