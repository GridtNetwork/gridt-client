import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private auth: AuthService
    ) { }

  ngOnDestroy() {
    this.cancelAllSubscriptions();
  }

  private cancelAllSubscriptions() {
    this.subscriptions.map( subscription => subscription.unsubscribe() );
  }
  /*
   * Log user in with api and handle loading popup
   */
  public async authenticate(email: string, password: string) {
    const el = await this.loadingCtrl.create({
      keyboardClose: true, 
      message: 'Logging in...' 
    });

    el.present();

    this.subscriptions.push(this.auth.login$(email, password).subscribe(
      loggedIn => {
        if (!loggedIn) {
          el.dismiss();
          this.showAlert("Failed to login");
        }
        this.router.navigateByUrl('/home');
        el.dismiss();
      },
      error => {
        el.dismiss();
        this.showAlert(error);
      }
    ));
  }

  /*
   * Handle form validation.
   */
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const password = form.value.password;
    const email = form.value.email;

    this.authenticate(email, password);
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
