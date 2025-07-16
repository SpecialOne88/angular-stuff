import { HttpErrorResponse } from "@angular/common/http";
import { AbstractControl } from "@angular/forms";
import { distinctUntilChanged, interval, map, merge, MonoTypeOperatorFunction } from "rxjs";

export function getMessageFromError(error: Error) {
    if (!error) {
        return 'Unexpected Error';
    }

    if (error instanceof HttpErrorResponse) {
        return error.error ?
            `${error.statusText} (${error.status}) : ${error.error.message}` :
            `${error.statusText} (${error.status})`;
    }

    return error.message;
}

// Workaround for a bug in formcontrol statuschange not triggering on creation
// Usage:
// myControl.statusChanges.pipe(fixFormStatus(myControl))
export const fixFormStatus: (
    control: AbstractControl,
    interval?: number
) => MonoTypeOperatorFunction<string> = (control, i = 250) => source =>
    merge(
        source,
        interval(i).pipe(map(() => control.status))
    ).pipe(
        distinctUntilChanged()
    );

// example of an array of items into a type with validation function
const vehicles = ['car', 'moto', 'van'] as const;
export type VehicleType = typeof vehicles[number];
export function validateVehicleType(value: unknown): boolean {
    return vehicles.indexOf(value as VehicleType) >= 0;
}