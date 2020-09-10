import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-expandable",
  templateUrl: "./expandable.component.html",
  styleUrls: ["./expandable.component.scss"],
})
export class ExpandableComponent implements OnInit {

  @Input() signalMessage;
  itemExpanded = false;

  constructor() { }

  ngOnInit() {}

  async toggleFullMessage() {
    if(this.signalMessage.length > 10) {
      this.itemExpanded = !this.itemExpanded;
    }
  }


}
