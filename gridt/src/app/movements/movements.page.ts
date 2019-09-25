import { Component, OnInit } from '@angular/core';

import { movements } from '../mock-movements';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  public movements = movements;

}
