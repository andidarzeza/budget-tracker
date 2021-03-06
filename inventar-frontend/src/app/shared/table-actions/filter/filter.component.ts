import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { FilterOptions } from './filter.models';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @Output() public onReset = new EventEmitter(); 
  @Output() public onSearch = new EventEmitter();
  @Input() filterOptions: FilterOptions[];
  public formGroup: FormGroup = this.formBuilder.group({});

  constructor(
    private formBuilder: FormBuilder,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.filterOptions?.forEach((filterOption: FilterOptions) => {
      this.formGroup.addControl(filterOption.field, new FormControl());
    })
  }

  onEnter(): void {
    this.search();
  }

  reset(): void {
    this.formGroup.reset();
    this.onReset.emit();
  }

  search(): void {
    let params: HttpParams = new HttpParams();
    for (const [key, value] of Object.entries(this.formGroup.value)) {
      if(value) {
        params = params.append(key, value as string);
      }
    }
    this.onSearch.emit({
      params
    });
  }

}
