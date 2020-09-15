import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-expandable",
  templateUrl: "./expandable.component.html",
  styleUrls: ["./expandable.component.scss"],
})
export class SignalMessageComponent implements OnInit{

  @Input() signalText;
  itemExpanded = false;
  width = 0;
  ngOnInit() {
    this.width = document.getElementById('signalText').offsetWidth;
  }

  toggleFullMessage() {
    if (this.signalText.length > this.width) {
      this.itemExpanded = !this.itemExpanded;
    }
  }
}
