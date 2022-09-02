import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.css']
})
export class AppearanceComponent implements OnDestroy {
  private subject = new Subject();

  constructor(
    public sharedService: SharedService,
    private configurationService: ConfigurationService,
  ) { }


  changeTheme(value: boolean): void {
    this.configurationService.configuration.darkMode = value;
    this.configurationService
      .updateConfiguration()
      .pipe(takeUntil(this.subject))
      .subscribe(() => {
        this.sharedService.changeTheme();
      });
  }

  ngOnDestroy(): void {
    this.subject.next();
    this.subject.complete();
  }
}
