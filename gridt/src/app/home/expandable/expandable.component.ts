import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-expandable",
  templateUrl: "./expandable.component.html",
  styleUrls: ["./expandable.component.scss"],
})
export class ExpandableComponent implements OnInit {

  @Input() expanded;
  @Input() expandedHeight;

  currentHeight = 0;

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this.expanded);
    console.log(this.expandedHeight);
  }

}
