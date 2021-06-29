# Typescript iCalendar Parser

A small app I wrote to testing parse iCal files with React + Typescript.  
Uses the [ical.js](https://github.com/peterbraden/ical.js) and [rrule.js](https://github.com/jakubroztocil/rrule) libraries  
  
Note: I only tested this with my school timetable calendar (with events on Monday-Friday).  
  
Uses a file drag and drop box from [this](https://spin.atomicobject.com/2018/09/13/file-uploader-react-typescript/) example.  
  
#### Assumptions made
* With this code, I assume that calendar events do not last for longer than a day.  
* Each entry has at least a description.  