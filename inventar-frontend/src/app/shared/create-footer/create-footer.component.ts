import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'create-footer',
  templateUrl: './create-footer.component.html',
  styleUrls: ['./create-footer.component.css']
})
export class CreateFooterComponent implements OnInit {

  @Output() create = new EventEmitter();

  constructor(
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
  }

  add(): void {
    this.create.emit();
  }

}
