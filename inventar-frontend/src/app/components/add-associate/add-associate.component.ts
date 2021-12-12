import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IAssociate } from 'src/app/models/IAssociate';
import { AssociateService } from 'src/app/services/associate.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-add-associate',
  templateUrl: './add-associate.component.html',
  styleUrls: ['./add-associate.component.css']
})
export class AddAssociateComponent implements OnInit {
  buttonText = "Shto Anetar";
  private mode = '';
  private id = '';
  constructor(public sharedService: SharedService, private toaster: ToastrService, @Inject(MAT_DIALOG_DATA) public associate: IAssociate, public dialogRef: MatDialogRef<AddAssociateComponent>, private formBuilder: FormBuilder, private associateService: AssociateService) {}
  associateGroup:FormGroup = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [null]
  })
  ngOnInit(): void {
    if(this.associate) {
      this.mode = 'edit';
      this.id = this.associate.id;
      this.buttonText = 'Perditeso Anetar';
      this.associateGroup.patchValue(this.associate);
    }else{
      this.mode = 'add';
    }
  }

  addAssociate(): void {
    if(this.associateGroup.valid){
      if(this.mode === 'edit') {
        this.associate.firstName = this.associateGroup.get('firstName').value;
        this.associate.lastName = this.associateGroup.get('lastName').value;
        this.associate.phoneNumber = this.associateGroup.get('phoneNumber').value;
        this.associateService.updateAssociate(this.associate).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u perditesua me sukses", "Sukses!", {
            timeOut: 7000
          });
        });
      } else {
        this.associateService.addAssociate(this.associateGroup.value).subscribe((res:any) => {
          this.closeDialog(true);  
          this.toaster.success("Anetari u shtua me sukses", "Sukses!", {
            timeOut: 7000
          });    
        });
      }
    }
  }

  closeDialog(update: any): void {
    this.dialogRef.close(update);
  }

}
