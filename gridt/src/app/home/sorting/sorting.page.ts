import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { SecureStorageService } from 'src/app/core/secure-storage.service';

@Component({
  selector: 'app-sorting',
  templateUrl: './sorting.page.html',
  styleUrls: ['./sorting.page.scss'],
})
export class SortingPage implements OnInit {
  selected_value;
  sortingOption: string = "";
  filterOption: string[] = [""];
  constructor(
    private secStorage: SecureStorageService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.secStorage.get$("sortingOption").pipe(take(1)).subscribe(
      (option) => this.sortingOption = option,
      (err) => console.log(err)
    );
    this.secStorage.get$("filterOption").pipe(take(1)).subscribe(
      (option) => this.filterOption = option,
      (err) => console.log(err)
    );
  }
  
  handleSort() {
   console.log(this.filterOption, this.sortingOption);
   this.sort();
   this.filter();
   this.modalController.dismiss({
     "option": this.sortingOption
   });
 }

  async sort() {
    this.secStorage.set$("sortingOption", this.sortingOption).pipe(take(1)).subscribe();
  }
  async filter() {
    await this.secStorage.set$("filterOption", this.filterOption).pipe(take(1)).subscribe();
  }

  async getValues() {
    await this.secStorage.get$("sortingOption").pipe(take(1)).subscribe(
      (option) => console.log(option),
      (err) => console.log(err)
    );
  }

}
