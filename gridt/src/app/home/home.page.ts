import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../api/api.service';
import { AlertController } from '@ionic/angular';
import { Movement } from '../api/movement.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  private subscriptions = [];
  movements$ = new Observable<Movement[]>();
 
  constructor(private api: ApiService, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.movements$ = this.api.subscriptions$;
    this.api.getSubscriptions();
  }

  ngOnDestroy() { }

  update(movement: Movement) {
    this.api.sendUpdate$(movement.name).subscribe(
      () => {},
      (error) => {
        this.alertCtrl.create({
            header: 'Authentication failed',
            message: error,
            buttons: ['Okay']
        })
        .then(alertEl => alertEl.present())
      }
    );
  }
}
