export class ScrollLoader {
  private element: any;
  constructor(element: any) {
    this.element = element;
  }

  listenForScrollChange(elem: any) {
    return {
      onScroll: (callable: any) => {
        elem.addEventListener('scroll', function (event) {
          var element = event.target;
          // console.log(element.scrollHeight, element.scrollTop, (element.clientHeight));

          if (element.scrollHeight - element.scrollTop === (element.clientHeight)) {
            callable.call();
          }
        });
      }
    }
  }
}