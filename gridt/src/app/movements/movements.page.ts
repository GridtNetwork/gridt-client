import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';

import { MovementsService } from './movements.service';
import { ApiService } from '../api/api.service';
import { Movement } from '../api/movement.model';


@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit, OnDestroy {
  searchData: any = [];
  search_input: string;
  movements$: Observable<Movement[]>;

  constructor(
    private api: ApiService,
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.movements$ = this.api.allMovements$;
    this.api.getAllMovements();
  }

  showError(error:string) {
    // TODO: Implement
  }

  onOpenMenu() {
    this.menuCtrl.toggle(); 
  } 

  ngOnDestroy() {
  }
}
