
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { ModalController, NavController, MenuController } from '@ionic/angular';

import { Subscription } from 'rxjs';
import { MovementsService } from './movements.service';


@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
})
export class MovementsPage implements OnInit, OnDestroy {
  
  searchData: any = [];
  movements: Movement[];
  isLoading = false;
  private sub : Subscription;
  constructor(
    private movementsService: MovementsService,
    private modalCtrl: ModalController,
    private menuCtrl: MenuController

    ) { }

  public movements = movements;

  ngOnInit() {
    
    this.sub = this.movementsService.movements.subscribe(mm => {
      this.movements = mm;
    });
   
  }

  ionViewWillEnter() {
  
    this.isLoading = true;
    this.movementsService.fetchMovements().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  Searchbar(ev: any){

    this.sub = this.movementsService.movements.subscribe(mm => {
      this.movements = mm;
    });
    const val = ev.target.value;
    if (val && val.trim() !== ''){

      this.movementsService.movements.subscribe(mm => {
        this.movements=  this.movements.filter((item) => {
          return(item.name.toLowerCase().indexOf(val.toLowerCase()) > - 1);
        });
       
      }
        );
    }

    
  }


  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
