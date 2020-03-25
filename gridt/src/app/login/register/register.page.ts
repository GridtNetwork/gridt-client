import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {


  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private api: ApiService,
    ) { }

  ngOnInit() {
  }

  /*
   * Do API call and handle loading element.
   */
  public async register (email: string, password: string) {
    const el = await this.loadingCtrl.create({ 
      keyboardClose: true,
      message: 'Signing you up...' 
    });

    this.api.register$(email, email, password).subscribe(
      () => {
        this.router.navigateByUrl('/login');
        el.dismiss();
      },
      (error) => {
          this.showAlert(error);
          el.dismiss();
      }
    )
    el.present();
  }

  //Submits the registration info
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.register(email, password);
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Signup failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
