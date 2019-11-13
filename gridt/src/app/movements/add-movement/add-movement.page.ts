import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MovementsService } from '../movements.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-movement',
  templateUrl: './add-movement.page.html',
  styleUrls: ['./add-movement.page.scss'],
})
export class AddMovementPage implements OnInit {

  form: FormGroup;

  constructor(
    private movementsService: MovementsService,
    private router: Router,
    private loadingCtrl: LoadingController
    ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      shortDescription: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
  });
}

onCreateMovement() {
  if (!this.form.valid) {
    return;
  }
  this.loadingCtrl
    .create({
      message: 'Creating a movement...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.movementsService
        .addMovements(
          this.form.value.name,
          this.form.value.description,
          this.form.value.shortDescription,

        )
        .subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/movements']);
        });
    });
}


}
