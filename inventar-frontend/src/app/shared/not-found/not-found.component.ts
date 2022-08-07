import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private route: Router,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
  }

  navigate(page: string){
		this.route.navigate([`/${page}`]);
	}

}
