import { Directive, effect, input, TemplateRef, ViewContainerRef } from "@angular/core";
import { map, of } from "rxjs";

@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective {

    private hasView: boolean = false;

    public appHasPermission = input<string | string[]>();

    constructor(private readonly templateRef: TemplateRef<unknown>,
        private readonly viewContainer: ViewContainerRef) {

        effect(() => {
            const permission = this.appHasPermission();
            if (!permission) {
                return;
            }

            if (typeof permission === 'string') {
                // check permission in some service
                of(permission).pipe(
                    map(x => {
                        return x === 'SHOW_ME';
                    })
                ).subscribe({
                    next: hasPermission => {
                        if (hasPermission) {
                            if (!this.hasView) {
                                this.viewContainer.createEmbeddedView(this.templateRef);
                                this.hasView = true;
                            }
                        } else {
                            if (this.hasView) {
                                this.viewContainer.clear();
                                this.hasView = false;
                            }
                        }
                    }
                });
            } else {
                // check permissions array in some service
                of(permission).pipe(
                    map(x => {
                        return x.includes('MAMA');
                    })
                ).subscribe({
                    next: hasPermission => {
                        if (hasPermission) {
                            if (!this.hasView) {
                                this.viewContainer.createEmbeddedView(this.templateRef);
                                this.hasView = true;
                            }
                        } else {
                            if (this.hasView) {
                                this.viewContainer.clear();
                                this.hasView = false;
                            }
                        }
                    }
                });
            }
        });
    }
}