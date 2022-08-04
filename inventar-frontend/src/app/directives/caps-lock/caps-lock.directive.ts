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

    if (event?.code?.startsWith("Key") && !event?.shiftKey) {
      this.capsLockOn = event?.key === event?.key?.toUpperCase();
      this.el.nativeElement.style.height = this.capsLockOn ? "20px" : "0";
      localStorage.setItem("capsLock", String(this.capsLockOn));
    }

    if (event?.code === "CapsLock") {
      this.capsLockOn = !event.getModifierState("CapsLock");
      this.el.nativeElement.style.height = this.capsLockOn ? "20px" : "0";
    }
  }


}
