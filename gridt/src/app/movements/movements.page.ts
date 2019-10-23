import { Component, OnInit } from '@angular/core';

import { MovementsService } from './movement.service';
import { Movement } from 'src/api/model/movement';
import { ModalController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { MovementJoinComponent } from './movement-join/movement-join.component';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit {

  movements: Movement[];
  movement: Movement;
  constructor(
    private movementsService: MovementsService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
    ) { }

    

  ngOnInit() {

    this.route.paramMap.subscribe(paramMap => {
      this.movement = this.movementsService.getMovement(paramMap.get('movementId'));
      console.log(this.movement.name);
    });
    
    this.movements = this.movementsService.movements;
  }

  onJoin() {
    console.log(this.movement.name);

    this.modalCtrl
      .create({
        component: MovementJoinComponent,
        componentProps: { selectedMovement: this.movement }
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then(resultData => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {
  
        }
      });
  }
}
