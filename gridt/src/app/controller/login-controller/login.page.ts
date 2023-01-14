import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../model/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: '../../view/login-view/login.page.html',
  styleUrls: ['../../view/login-view/login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private auth: AuthService
    ) { }

  ngOnInit() { 
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

    this.auth.login$(email, password).subscribe(
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
    );
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
