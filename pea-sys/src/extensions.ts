import {diffDay, diffYear, toCE, toRepublicYear} from './utils/date';

declare global {
    interface Date {
        diffDay(target: Date): number;
        diffYear(target: Date): number;
        toRepublicYear(): Date;
        toCE(): Date;
    }
}

Date.prototype.diffDay = diffDay;
Date.prototype.diffYear = diffYear;
Date.prototype.toRepublicYear = toRepublicYear;
Date.prototype.toCE = toCE;