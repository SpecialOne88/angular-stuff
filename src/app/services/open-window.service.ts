import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class OpenWindowService {
    private readonly document = inject(DOCUMENT);

    public openLinkInTab(url: string) {
        const link = this.document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');

        this.document.body.appendChild(link);
        link.click();
        this.document.body.removeChild(link);
    }
}