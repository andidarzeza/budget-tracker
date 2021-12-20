import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public sharedService: SharedService, private formBuilder: FormBuilder) { }
  loginGroup: FormGroup = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  
  get username(){
    return this.loginGroup.controls['username'];
  }

  get password() {
    return this.loginGroup.controls['password'];
  }

  ngOnInit(): void {
  }

}
