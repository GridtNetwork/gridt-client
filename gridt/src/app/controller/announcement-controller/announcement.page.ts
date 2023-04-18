import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';

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
  }

}
