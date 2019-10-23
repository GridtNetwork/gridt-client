import { Component, OnInit, Input } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-movement-join',
  templateUrl: './movement-join.component.html',
  styleUrls: ['./movement-join.component.scss'],
})
export class MovementJoinComponent implements OnInit {
  @Input() selectedMovement: Movement;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onJoin() {
    this.modalCtrl.dismiss({ message: 'This is a dummy message!' }, 'confirm');
  }


}
