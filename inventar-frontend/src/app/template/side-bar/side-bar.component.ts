import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements AfterViewInit {
  
  constructor(
    public sharedService: SharedService,
    public authenticationService: AuthenticationService,
    public sideBarService: SideBarService
  ) { }
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

  animateSelectedOption(index: number): void {
    const activeItem = document.getElementById("active-item") as HTMLElement;
    if(activeItem) {
      activeItem.style.transform = `translateY(${index * 100}%)`;
    }
    
  }

}
