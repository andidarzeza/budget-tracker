export class ScrollLoader {
  private element: any;
  constructor(element: any) {
    this.element = element;
  }

  listenForScrollChange() {
    return {
      onScroll: (callable: any) => {
        this.element.addEventListener('scroll', function (event) {
          var elem = event.target;
          if (elem.scrollHeight - elem.scrollTop < elem.clientHeight + 50) {
            callable.call();
          }
        });
      }
    }
  }
}