import { Component, OnInit } from '@angular/core';
import { LoginService, AuthResponseData } from './login.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private api: ApiService
    ) { }

  ngOnInit() { }

  /*
   * Log user in with api and handle loading popup
   */
  public async authenticate(email: string, password: string) {
    const el = await this.loadingCtrl.create({ 
      keyboardClose: true, 
      message: 'Logging in...' 
    });

    el.present();

    this.api.login$(email, password).subscribe(
      loggedIn => {
        if (!loggedIn) {
          el.dismiss();
          this.showAlert("Failed to login");
        }
        this.router.navigate(['/timeline']);
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
    const email = form.value.email;
    const password = form.value.password;

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

