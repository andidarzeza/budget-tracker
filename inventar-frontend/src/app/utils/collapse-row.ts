/**
 * Fold a list row away (height and opacity to zero), then run `remove` —
 * the delete. If the row is still in the page 2.5 s later (the delete
 * failed), bring it back. Shared by long-press and swipe-to-delete.
 */
export function collapseThenRemove(row: HTMLElement, remove: () => void): void {
  // One delete per row: while it folds away, no other gesture may start one.
  if (row.classList.contains('row-removing')) return;
  row.classList.add('row-removing');
  row.style.overflow = 'hidden';
  const collapse = row.animate(
    [{ height: `${row.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
    { duration: 280, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
  );
  collapse.finished.then(() => {
    remove();
    setTimeout(() => {
      if (!row.isConnected) return;
      row.classList.remove('row-removing');
      collapse.cancel();
      row.style.overflow = '';
      row.style.visibility = '';
      row.dispatchEvent(new CustomEvent('row-restored'));
    }, 2500);
  });
}
