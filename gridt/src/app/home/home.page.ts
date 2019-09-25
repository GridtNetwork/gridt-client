import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  text = 'Don\'t look down'

  onChangeText() {
    this.text = 'Well done! You completed you assignment.'
  }

}
