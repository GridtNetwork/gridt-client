import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Movement } from '../../core/models/movement.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-movement',
  templateUrl: './add-movement.page.html',
  styleUrls: ['./add-movement.page.scss'],
})
export class AddMovementPage implements OnInit, OnDestroy {
  
  private subscriptions: Subscription[] = [];
  form: FormGroup;
  intervalTypes: string[] = [
    'daily',
    'twice daily',
    'weekly'
  ];

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl("", {
        updateOn: 'blur',
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50)
         ]
      }),
      description: new FormControl("", {
        updateOn: 'blur',
      }),
      short_description: new FormControl("", {
        updateOn: 'blur',
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100)
        ]
      }),
      interval: new FormControl("", [Validators.required])
    });
  }

  ngOnDestroy() {
    if (this.alertCtrl) {
      this.alertCtrl.dismiss();
    }
    this.cancelAllSubscriptions();
  }

  private cancelAllSubscriptions() {
    this.subscriptions.map( subscription => subscription.unsubscribe() );
  }

  async createMovement() {
    if (!this.form.valid) {
      return;
    }

    const el = await this.loadingCtrl.create({
      message: 'Creating a movement...'
    });

    await el.present();

    this.subscriptions.push(this.api.createMovement$(this.form.value as Movement).subscribe(
      (message) => {
        el.dismiss();
        this.showMessage(message);
        this.subscriptions.push(this.api.getMovement$(this.form.value.name).subscribe({
        error(err) {
          el.dismiss();
          this.showError(err);
        },
      }));
      },
      (error) => {
        el.dismiss();
        this.showError(error);
      }
    ));
  }

  async confirmCreation () {
    const el = await this.alertCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create it!',
          handler: () => this.createMovement()
        }
      ]
    });

    el.present();
  }

  async showError (error: string) {
    const el = await this.alertCtrl.create({
      header: 'Could not create movement.',
      message: error,
      buttons: [{
        text: 'Go back',
        role: 'cancel'
      }]
    })

    el.present();
  }

  async showMessage (message: string) {
    const el = await this.alertCtrl.create({
      header: 'Created Movement',
      message: message,
      buttons: [{
        text: 'Okay',
        handler: () => this.router.navigate(['movements'])
      }]
    });

    el.present();
  }
}
