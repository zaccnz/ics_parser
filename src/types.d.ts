interface CalendarEvent {
    name: string;
    description: string;
    uid: string;             /* a unique id for this event -- note, multiple events can have the
                                same uid, which helps to group them together while editing */
    start: Date;             /* the date that this event starts */
    end: Date;               /* the date that this event ends */
}

// Functions
type OnFileSelected = (file: File) => void;
type SetWeek = (date: string) => void;

// Custom types
type Calendar = Record<string, CalendarEvent[]>;
type CalendarThisWeek = CalendarEvent[][];