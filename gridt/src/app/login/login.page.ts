import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private api: ApiService
    ) { }

  ngOnInit() { 
  }

  /*
   * Log user in with api and handle loading popup
   */
  public async authenticate(username: string, password: string) {
    const el = await this.loadingCtrl.create({ 
      keyboardClose: true, 
      message: 'Logging in...' 
    });

    el.present();

    this.api.login$(username, password).subscribe(
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
    const username = form.value.username;

    this.authenticate(username, password);
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
