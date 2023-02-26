import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class SideBarComponent implements OnChanges, AfterViewInit {

  @Input() navigation: MenuItem[];
  @Input() sideBarMode: SideBarMode;

  selIndex = 1;
  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sideBarService: SideBarService,
    public router: Router
  ) { }

  ngAfterViewInit(): void {
    const sideBarStatus = localStorage.getItem("fms-sidebar");
    if(sideBarStatus) {
      if(sideBarStatus == "true") {
        this.sideBarService.isOpened = true;
        this.sideBarService.openSideBar();
      } else {
        this.sideBarService.isOpened = false;
        this.sideBarService.closeSideBar();
      }
    } else {
      this.sideBarService.isOpened = false;
      this.sideBarService.closeSideBar();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.navigation?.forEach((item: MenuItem) => {
      if (item.link === window.location.pathname || window.location.pathname.includes(item.link)) {
        setTimeout(() => {
          this.animateSelectedOption(this.navigation.indexOf(item));
        }, 0)
      }
    });
  }

  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById("active-item") as HTMLElement;
    if (activeItem) {
      const margin = index + 1;
      activeItem.style.transform = `translate(0%, calc(${index * 100}% + ${(index * 3) + (margin * 3)}px))`;
    }
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
