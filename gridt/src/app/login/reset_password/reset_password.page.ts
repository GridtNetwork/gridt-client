import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset_password',
  templateUrl: './reset_password.page.html',
  styleUrls: ['./reset_password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private auth: AuthService,
    ) { }

  ngOnInit() {
  }

}
