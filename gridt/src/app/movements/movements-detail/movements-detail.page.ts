import { Component, OnInit, Input } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-movements-detail',
  templateUrl: './movements-detail.page.html',
  styleUrls: ['./movements-detail.page.scss'],
})
export class MovementsDetailPage implements OnInit {

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
