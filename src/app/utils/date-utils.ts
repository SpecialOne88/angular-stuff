import { enUS, it } from 'date-fns/locale';

export const DEFAULT_LANG_ID = (navigator.languages ? navigator.languages.find(l => l.startsWith('en') || l.startsWith('it')) || 'en' : 'en').substring(0, 2);
export const dateFnsLocale = DEFAULT_LANG_ID === 'it' ? it : enUS;

export const MY_FORMATS = {
    parse: {
        dateInput: 'dd/MM/yyyy',
        timeInput: 'HH:mm'
    },
    display: {
        dateInput: 'dd/MM/yyyy',
        monthYearLabel: 'MMMM yyyy',
        dateA11yLabel: 'dd/MM/yyyy',
        monthYearA11yLabel: 'MMMM yyyy',
        timeInput: 'HH:mm',
        timeOptionLabel: 'HH:mm'
    },
};