import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCapsLock]'
})
export class CapsLockDirective {
  private capsLockOn = false;
  constructor(private el: ElementRef) {
    
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if(event?.key && event.code) {
      if(event.code.startsWith("Key") && !event.shiftKey) {
        if (event?.key === event?.key?.toUpperCase()) {
          this.capsLockOn = true;
          localStorage.setItem("capsLock", "true");
          this.el.nativeElement.style.height = "20px"
        } else {
          this.capsLockOn = false;
          localStorage.setItem("capsLock", "false");
          this.el.nativeElement.style.height = "0px"
        }
      }

    }
    if(event.code === "CapsLock") {     
      console.log();
      if(event.getModifierState("CapsLock")) {
        this.capsLockOn = false;
        localStorage.setItem("capsLock", "false");
      } else {
        this.capsLockOn = true;
        localStorage.setItem("capsLock", "true");
      }
       
      if(this.capsLockOn)
        this.el.nativeElement.style.height = "20px"
      else
        this.el.nativeElement.style.height = "0"
    }
  }


}
