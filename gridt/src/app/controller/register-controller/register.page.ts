import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../model/services/auth.service';
import { PrivacyPage } from 'src/app/controller/privacy-controller/privacy.page';

@Component({
  selector: 'app-register',
  templateUrl: '../../view/register-view/register.page.html',
  styleUrls: ['../../view/register-view/register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {


  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private auth: AuthService,
    public modalController: ModalController,
    ) { }

  ngOnInit() {
    this.showSafetyAlert();
  }

  ngOnDestroy() {
    this.alertCtrl.dismiss();
  }
  /*
  * Creates warning for unique password
  */
  private async showSafetyAlert() {
    const alert = await this.alertCtrl.create({
      header: "Warning",
      subHeader: "Password Safety",
      message: "This app is in Alpha and therefore we cannot guarantee the safety of your data. Please keep this in mind when picking your password. We recommend you pick a password you do not use anywhere else.",
      buttons: ["Accept"],
      backdropDismiss: false
    });

    await alert.present();
  }

  /*
   * Do API call and handle loading element.
   */
  public async register (username:string, email: string, password: string ) {
    const el = await this.loadingCtrl.create({ 
      keyboardClose: true,
      message: 'Signing you up...' 
    });

    this.auth.register$(username, email, password).subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
        el.dismiss();
      },
      error: (error) => {
          this.showAlert(error);
          el.dismiss();
      }
    })
    el.present();
  }

  //Submits the registration info
  accept: any;
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
    console.debug("present privacy-controller policy");
    return await modal.present();
  }

}
