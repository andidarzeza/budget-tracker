import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { MenuItem, SideBarMode } from './base-template.models';


@Component({
  selector: 'base-template',
  templateUrl: './base-template.component.html',
  styleUrls: ['./base-template.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('400ms ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ opacity: 1 }),
            animate('400ms ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class BaseTemplateComponent implements OnInit, OnDestroy {

  private subject = new Subject();

  constructor(
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    public sideBarService: SideBarService,
    private http: HttpClient,
    public navBarService: NavBarService
  ) { }

  navigation: MenuItem[];
  sideBarMode: SideBarMode = "side";

  ngOnInit(): void {
    if(this.sideBarMode == "over") {
      this.sideBarService.isOpened = false;
    }
    this.getNavigationItems();
  }

  private getNavigationItems(): void {
    this.http
    .get("assets/navigation.json")
    .pipe(takeUntil(this.subject))
    .subscribe((data: MenuItem[]) => this.navigation = data);
  }

  toggleSidebar(): void {
    this.sideBarService.toggleSideBar();
  }

  ngOnDestroy(): void {
    this.subject.next();
    this.subject.complete();
  }
}
