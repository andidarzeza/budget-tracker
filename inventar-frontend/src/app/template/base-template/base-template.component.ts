import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { slider } from 'src/app/animations';
import { inOutAnimation } from 'src/app/components/settings/dynamic-dropdown/animations';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { RouteSpinnerService } from 'src/app/services/route-spinner.service';
import { SharedService } from 'src/app/services/shared.service';
import { SideBarService } from 'src/app/services/side-bar.service';
import { Unsubscribe } from 'src/app/shared/unsubscribe';
import { MenuItem, SideBarMode } from './base-template.models';


@Component({
  selector: 'base-template',
  templateUrl: './base-template.component.html',
  styleUrls: ['./base-template.component.css'],
  animations: [
    inOutAnimation,
    slider
  ]
})
export class BaseTemplateComponent extends Unsubscribe implements OnInit {

  @Input() outlet: RouterOutlet;

  constructor(
    public authenticationService: AuthenticationService,
    public sharedService: SharedService,
    public sideBarService: SideBarService,
    private http: HttpClient,
    public navBarService: NavBarService,
    public routeSpinnerService: RouteSpinnerService
  ) {
    super();
  }

  navigation: MenuItem[];
  sideBarMode: SideBarMode = "side";

  ngOnInit(): void {
    if(this.sideBarMode == "over") {
      this.sideBarService.isOpened = false;
    }
    this.getNavigationItems();
  }


  prepareRoute() {
    return this.outlet && this.outlet?.activatedRouteData && this.outlet?.activatedRouteData['animation'];
  }


  private getNavigationItems(): void {
    this.http
    .get("assets/navigation.json")
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((data: MenuItem[]) => this.navigation = data);
  }

  toggleSidebar(): void {
    this.sideBarService.toggleSideBar();
  }

}
