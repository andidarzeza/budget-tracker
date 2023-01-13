export class ScrollLoader {
  private element: any;
  constructor(element: any) {
    this.element = element;
  }

  listenForScrollChange(margin: number) {    
    return {
      onScroll: (callable: any) => {
        this.element.addEventListener('scroll', function (event) {
          var elem = event.target;
          if (elem.scrollHeight - elem.scrollTop < elem.clientHeight + margin) {
            callable.call();
          }
        });
      },
      onTopScroll: (callable: any) => {
        this.element.addEventListener('scroll', function (event) {
          var elem = event.target;          
          if (elem.scrollTop == 0) {            
            callable.call();
          }
        });
      }
    }
  }
}