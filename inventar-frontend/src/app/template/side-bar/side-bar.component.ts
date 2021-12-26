import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements AfterViewInit {
  isOpened = false;
  constructor(public sharedService: SharedService, public authenticationService: AuthenticationService) { }
  items = [
    {
      icon: 'dashboard',
      text: 'Dashboard',
      link: '/dashboard'
    },{
      icon: 'attach_money',
      text: 'Expenses',
      link: '/expenses'
    },{
      icon: 'transit_enterexit',
      text: 'Incomes',
      link: '/incomes'
    },
    {
      icon: 'library_books',
      text: 'Categories',
      link: '/categories'
    },
    {
      icon: 'history',
      text: 'History',
      link: '/history'
    },
    {
      icon: 'settings',
      text: 'Settings',
      link: '/settings'
    }

  ];

  ngAfterViewInit(): void {
    this.items.forEach((item: any) => {
      if(item.link === window.location.pathname) {
        const index = this.items.indexOf(item);        
        this.animateSelectedOption(index);
      }
    });
  }

  toggleSideBar(): void {
    if(this.isOpened) {
      this.closeSideBar();
    } else {
      this.openSideBar();
    }
    this.isOpened = !this.isOpened;
  }

  openSideBar(): void {
    const sideBar = document.getElementById('sidebar') as HTMLElement;
    const shadow = document.getElementById('shadow') as HTMLElement;
    const application = document.getElementById('application-body') as HTMLElement;
    sideBar.style.width = `${this.sharedService.sidebarWidth}px`;
    if(window.innerWidth > 1140) {
      application.style.width = `calc(${100}% - ${this.sharedService.sidebarWidth}px)`; 
    } else {
      shadow.style.opacity = "0.4";
      shadow.style.pointerEvents = "auto";
    }
    const items = document.getElementsByClassName('opened-menu-item') as HTMLCollection;
    for(var i = 0;i<items.length;i++) {
      const item = items[i] as HTMLElement;
      item.style.padding = '10px 25px';
    }
  }

  closeSideBar(): void {
    const sideBar = document.getElementById('sidebar') as HTMLElement;
    const application = document.getElementById('application-body') as HTMLElement;
    const shadow = document.getElementById('shadow') as HTMLElement;
    const toggle = document.getElementById('toggle-id') as HTMLElement;
    sideBar.style.width = '60px';
    if(window.innerWidth > 1140) {
      application.style.width = '100%';
    } else {
      shadow.style.opacity = "0";
      shadow.style.pointerEvents = "none";
    }
    toggle.style.left = '50%';
    toggle.style.transform =  'translateX(-50%)';
    const items = document.getElementsByClassName('opened-menu-item') as HTMLCollection;
    for(var i = 0;i<items.length;i++) {
      const item = items[i] as HTMLElement;
      item.style.padding = '10px 18px';
    }
  }


  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById("active-item") as HTMLElement;
    if(activeItem) {
      activeItem.style.transform = `translateY(${index * 100}%)`;
    }
    
  }

}
