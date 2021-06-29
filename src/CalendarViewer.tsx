import React from 'react';

interface Props {
  calendar: CalendarThisWeek;
  week: string;
  setWeek: SetWeek;
}

// A const array to store the days of the week
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// A function to convert an event's start and end times into a string
const eventToTime = (event: CalendarEvent): string => {
  return `\
${event.start.getHours().toString().padStart(2, '0')}:${event.start.getMinutes().toString().padStart(2, '0')}\
 to ${event.end.getHours().toString().padStart(2, '0')}:${event.start.getMinutes().toString().padStart(2, '0')}`;
};

export const CalendarViewer: React.FC<Props> = ({ calendar, week, setWeek }) => {
  /*
   * Small functions to add and remove a week from the current date
   */
  const backOneWeek = () => {
    let d = new Date(week);
    const diff = d.getDate() - 7;
    d = new Date(d.setDate(diff));
    setWeek(d.toUTCString());
  };
  const forwardsOneWeek = () => {
    let d = new Date(week);
    const diff = d.getDate() + 7;
    d = new Date(d.setDate(diff));
    setWeek(d.toUTCString());
  };

  return (
    <div>
      <p>{week} <button onClick={backOneWeek}>backwards</button><button onClick={forwardsOneWeek}>forwards</button></p>
      <hr />
      {
        /* Iterate over each day this week */
        calendar.map((day, i) => (
          <div key={i}>
            <p><strong>{daysOfWeek[day[0].start.getDay()]}</strong></p>
            {
              /* Iterate over each event today */
              day.map((event, j) => (
                <p key={j.toString() + '::' + i.toString()}>{event.name} ({event.description}) - {eventToTime(event)}</p>
              ))
            }
          </div>
        ))
      }
    </div>
  );
};