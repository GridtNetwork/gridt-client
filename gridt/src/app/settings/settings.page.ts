import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { NgForm } from '@angular/forms';

import { SettingsService} from '../core/settings.service'
import { Settings } from '../core/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit  {
  settings$: Observable<Settings>;
  isDisabled$: Observable<boolean>;
  gravatar: string;

  edit_bio$: boolean = true;
  edit_name$: boolean = true;
  edit_email$: boolean = true;
  edit_password$: boolean = true;

  constructor(
    private SetService: SettingsService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.SetService.populateStorage();
    this.settings$ = this.SetService.the_user_settings$;
    this.SetService.getUserSettings();

    this.isDisabled$ = this.SetService.isDisabled$;
    this.settings$.subscribe(set => this.gravatar = "https://www.gravatar.com/avatar/" + set.identity.avatar);
    console.log(`gravatar is ${this.gravatar}`)
  }

  @ViewChild('bio', {static: true}) bioInput;
  @ViewChild('name', {static: true}) nameInput;
  @ViewChild('email', {static: true}) emailInput;

  public refreshPage(event) {
    this.SetService.getUserSettings();
    event.target.complete();
  }


  Submit_bio_change(form: NgForm) {
    this.edit_bio$ = true;
    console.log(`Setting bio to ${form.value.bio}`)
  }

  Submit_name_change(form: NgForm) {
    this.edit_name$ = true;
    console.log(`Setting name to ${form.value.name}`)
  }

  Submit_email_change(form: NgForm) {
    this.edit_email$ = true;
    console.log(`Setting email to ${form.value.email}`)
  }

  Submit_password_change(form: NgForm) {
    console.log(form.value.name)
  }

  public change_bio() {
    this.edit_bio$ = false;
    this.bioInput.setFocus();
  }

  public change_name() {
    this.edit_name$ = false;
    this.nameInput.setFocus();
  }

  public change_email() {
    console.log('setting change_name to false')
    this.edit_email$ = false;
    this.emailInput.setFocus();
  }


}
