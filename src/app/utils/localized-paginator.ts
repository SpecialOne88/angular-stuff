import { MatPaginatorIntl } from "@angular/material/paginator";
import { TranslocoService } from "@jsverse/transloco";

export class LocalizedPaginator {

    constructor(private readonly translateService: TranslocoService) { }

    getPaginatorIntl(): MatPaginatorIntl {
        const paginator = new MatPaginatorIntl();
        paginator.itemsPerPageLabel = this.translateService.translate('PAGINATOR.ITEMS_PAGE');
        paginator.nextPageLabel = this.translateService.translate('PAGINATOR.NEXT_PAGE');
        paginator.previousPageLabel = this.translateService.translate('PAGINATOR.PREV_PAGE');
        paginator.firstPageLabel = this.translateService.translate('PAGINATOR.FIRST_PAGE');
        paginator.lastPageLabel = this.translateService.translate('PAGINATOR.LAST_PAGE');
        paginator.getRangeLabel = (page, pageSize, length) => {
            if (length === 0 || pageSize === 0) {
                return this.translateService.translate('PAGINATOR.RANGE_0', { length: length });
            }

            length = Math.max(length, 0);
            const startIndex = page * pageSize;

            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            return this.translateService.translate('PAGINATOR.RANGE_1', { start: startIndex, end: endIndex, length: length });
        };
        return paginator;
    }
}