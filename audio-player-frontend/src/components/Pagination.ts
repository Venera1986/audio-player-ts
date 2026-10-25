import { el } from 'redom';

interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function createPagination(options: PaginationOptions): HTMLElement {
  if (options.totalPages <= 1) {
    return el('div.pagination.pagination--empty');
  }

  const buttons: HTMLElement[] = [];

  for (let page = 1; page <= options.totalPages; page += 1) {
    buttons.push(
      el(
        'button',
        {
          className: page === options.currentPage
            ? 'pagination__button pagination__button--active'
            : 'pagination__button',
          type: 'button',
          onclick: () => options.onPageChange(page),
        },
        page.toString(),
      ),
    );
  }

  return el('div.pagination', buttons);
}
