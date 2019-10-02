import { Component, OnInit } from '@angular/core';

import { movements } from '../mockmovements';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit {

  constructor() { }

  public movements = movements;

  ngOnInit() {

  }
  
}
