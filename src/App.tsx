import React, { useState, useEffect } from 'react';
import ical from 'ical';

import { FileUploader } from './FileUploader';
import { CalendarViewer } from './CalendarViewer';

// Adapted from https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
function getStartOfWeek(d: Date) {
  // Remove time from date
  d = new Date(d.toDateString());

  // Find monday
  const day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 2); // adjust when day is sunday

  // Create a new date from this difference
  return new Date(d.setDate(diff));
}

function parseCalendar(calendar: ical.FullCalendar): Calendar {
  return Object.values(calendar)
    /* filter out all non-VEVENT entries, and those without uids */
    .filter(v => v.type == 'VEVENT' && v.uid !== undefined)
    /* map each calendar entry into a CalendarEvent object */
    .map(entry => {
      // pull out the description and startdate variables
      const description = entry.description !== undefined ? entry.description : '';
      const startDate = entry.start ? entry.start : new Date();

      /*
       * Create a calendar event.  If we have a summary, set this as the name.
       * Otherwise, we use the description, and leave the description blank
       */
      const event: CalendarEvent = {
        name: entry.summary !== undefined ? entry.summary : description,
        description: entry.summary !== undefined ? description : '',
        uid: entry.uid ? entry.uid : '',
        start: startDate,
        end: entry.end ? entry.end : startDate,
      };

      /*
       * If we have an rrule, we want to create a CalendarEvent for each
       * occurence of this event.
       */
      if (entry.rrule !== undefined) {
        // this event occurs more than once!
        const allOccurences = entry.rrule.all();

        // calculate the difference between the start and end of this event
        const endOffset = Math.abs(event.end.getTime() - event.start.getTime());

        /*
         * Map each occurence to be a new entry.  Since we flatten,
         * we can return an array of events.
         */
        return allOccurences.map(date => {
          // calculate a new end date
          const end = new Date(endOffset + date.getTime());
          return { ...event, start: date, end };
        });
      }

      // Return this event, as it is a one-off
      return {
        ...event
      };
    })
    /* Flatten the output to remove the lists that we create with rrules */
    .flat()
    /* Combine all of the events that occur on the same day */
    .reduce((result: Record<string, CalendarEvent[]>, value) => {
      const date = new Date(value.start.toDateString()).toISOString();

      if (Object.keys(result).includes(date)) {
        result[date].push(value);
        result[date].sort((i, j) =>
          i.start.getTime() - j.start.getTime()
        );
      } else {
        result[date] = [value];
      }

      return result;
    }, {});
}

// Small helper function to change the 'day' number to start from monday
const startMonday = (day: number): number => {
  return (day + 6) % 7;
};

// Initial variables
const startOfWeek = getStartOfWeek(new Date());
let calendar: Calendar = {};

function App(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(startOfWeek.toUTCString());
  const [thisWeekData, setThisWeekData] = useState<CalendarThisWeek>([]);

  // updates the 'thisWeek' state to contain data from
  // this week in the calendar
  const prepareWeekData = () => {
    const thisWeek = Object.keys(calendar)
      .filter(key => week == getStartOfWeek(new Date(key)).toUTCString())
      .sort((i, j) => startMonday(new Date(i).getDay()) - startMonday(new Date(j).getDay()))
      .map(key => calendar[key]);

    setThisWeekData(thisWeek);
  };

  const fileUpdated = () => {
    if (file === null) return; /* do nothing if we remove the file */

    // inform the user that we are reading / parsing
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result;
      if (typeof (text) === 'string') {
        // parse this calendar
        calendar = parseCalendar(ical.parseICS(text));

        // pull out the data from this week
        prepareWeekData();
        setLoading(false);
      } else {
        // tell the user we failed to open and read this file
        setLoading(false);
        alert('error reading file: ' + file.name);
      }
    };
    reader.readAsText(file);
  };

  /* An effect to parse the current file when we select a new one */
  useEffect(fileUpdated, [file]);

  /* An effect to change the thisWeek state when we update the current week */
  useEffect(prepareWeekData, [week]);

  return (
    <div className="App">
      {/* File uploader component used to get an input file */}
      <FileUploader fileTypes={['text/calendar']} onFileSelected={setFile} />
      {
        loading && (<span>reading calendar...</span>)
      }

      {/* Tell the user which file is being read */}
      {
        file !== null && (<span>the selected file is {file.name}</span>)
      }

      {/* Render calendar contents with a CalendarViewer component */}
      {
        calendar && <CalendarViewer calendar={thisWeekData} week={week} setWeek={setWeek} />
      }
    </div>
  );
}

export default App;
