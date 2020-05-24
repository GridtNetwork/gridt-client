import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { PrivacyPage } from 'src/app/about/privacy/privacy.page';

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
    private auth: AuthService,
    public modalController: ModalController,
    ) { }

  ngOnInit() {
  }

  /*
   * Do API call and handle loading element.
   */
  public async register (username:string, email: string, password: string ) {
    const el = await this.loadingCtrl.create({ 
      keyboardClose: true,
      message: 'Signing you up...' 
    });

    this.auth.register$(username, email, password).subscribe(
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
    const username = form.value.username;
    const email = form.value.email;
    const password = form.value.password;

    this.register(username, email, password);
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

  async presentPrivacy() {
    const modal = await this.modalController.create({
      component: PrivacyPage
    });
    console.log("present privacy policy");
    return await modal.present();
  }

}
