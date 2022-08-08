import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { MenuItem, SideBarMode } from '../base-template.models';

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnChanges {
  
  @Input() navigation: MenuItem[];
  @Input() sideBarMode: SideBarMode;
  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sideBarService: SideBarService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes.navigation.firstChange) {
      this.navigation?.forEach((item: MenuItem) => {
        if(item.link === window.location.pathname) {
          this.animateSelectedOption(this.navigation.indexOf(item));
        }
      });
    }
  }
  
  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById("active-item") as HTMLElement;    
    if(activeItem) {
      const margin = index+1;
      activeItem.style.transform = `translate(-50%, calc(${index * 100}% + ${(index * 5) + (margin *5)}px))`;
    }
  }

}
