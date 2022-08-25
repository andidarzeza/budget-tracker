import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
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

  selIndex = 1;
  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sideBarService: SideBarService,
    public router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    
    // if(changes.navigation.firstChange) {
      this.navigation?.forEach((item: MenuItem) => {
        if(item.link === window.location.pathname) {
          setTimeout(()=>{
            this.animateSelectedOption(this.navigation.indexOf(item));
          },0)
        }
      });
    // }
  }
  
  animateSelectedOption(index: number): void {
    
    // setTimeout(() => {
      const activeItem = document.getElementById("active-item") as HTMLElement;   
      if(activeItem) {
        const margin = index+1;
        activeItem.style.transform = `translate(-50%, calc(${index * 100}% + ${(index * 5) + (margin *5)}px))`;
      }
    // }, 0);
    
  }


  // @HostListener('keydown', ['$event'])
  // onKeyUp(event: KeyboardEvent): void {
  //       // if (event.keyCode === 13) {
  //         console.log(event);
  //         if(event.code === "ArrowDown") {
  //           // this.router.navigate([this.navigation[this.selIndex].link]);
  //           this.animateSelectedOption(this.selIndex);
  //           this.selIndex++;
  //         } else if(event.code === "ArrowUp") {
  //           this.selIndex--;
  //           // this.router.navigate([this.navigation[this.selIndex].link]);
  //           this.animateSelectedOption(this.selIndex);
            
  //         }
          
  //       // }
  // }

}
