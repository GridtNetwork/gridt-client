import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, lastValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';

import { ApiService } from '../../model/services/api.service';
import { Announcement } from '../../model/interfaces/announcement.model';


@Component({
  selector: 'app-announcement-controller',
  templateUrl: '../../view/announcement-view/announcement.page.html',
  styleUrls: ['../../view/announcement-view/announcement.page.scss'],
})
export class AnnouncementPage implements OnInit {
  announcements$ = new Observable<Announcement[]>();
  @Input() movement: any;


  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.announcements$ = this.api.announcements$;
  }

  ngAfterViewInit() {
    this.api.getAnnouncements$(this.movement.id);
  }
  
  dismiss() {
    this.modalController.dismiss();
    this.alertCtrl.dismiss();
  }

  /**
   * This method is called when the new button is clicked.
   */
  async clickNew() {
    const alertElement = await this.alertCtrl.create({
      header: "New Announcement",
      message: null,
      cssClass: "confirmSignal-alert", // makes message text go red
      inputs: [{name: "message", placeholder: "announcement text", type: "text"}],
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
        },
        {
          text: "Send!",
          handler: (data) => {
            let message = data.message;
            if (message === null || message.length === 0) {
              alertElement.message = ('Your announcement is empty!');
              return false;
            }
            if (10 > message.length || message.length > 140) {
              alertElement.message = ('Your announcement is not between 10 and 140 characters!');
              return false;
            }
            console.log("POST https://api.gridt.org/movements/:id/announcements")
            this.newAnnouncement(message);
            return true;
          }
        }
      ]
    });

    alertElement?.present();
  }

  async newAnnouncement(message: string) {
    await lastValueFrom(
      this.api.postAnnouncement$(this.movement.id, message)
    );
    // Update the list of announcements
    this.api.getAnnouncements$(this.movement.id);
  }
}
