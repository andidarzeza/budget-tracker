import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.css']
})
export class AppearanceComponent implements OnInit {

  constructor(
    public sharedService: SharedService
  ) { }
  ngOnInit(): void {
    this.sharedService.changeTheme();
  }
}
