import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  constructor(private storage: Storage, private router: Router) { }

  async finish() {
    await this.storage.set('tutorialComplete', true);
    this.router.navigateByUrl('/');
    console.log(this.storage);
  }

  ngOnInit() {
  }

}
