import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "signal-message",
  templateUrl: "./signal-message.component.html",
  styleUrls: ["./signal-message.component.scss"],
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
