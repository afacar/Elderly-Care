
export const getFormattedDate = (date = new Date()) => {
  let today = date;
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();

  if (dd < 10) { dd = '0' + dd; }

  if (mm < 10) { mm = '0' + mm; }

  today = yyyy + '-' + mm + '-' + dd;

  return today;
}

export const getFormattedTime = (date) => {
  /** Take datetime object and return string representation of time as 09:30 */
  let time = new Date(date);
  let hr = time.getHours();
  let min = time.getMinutes();

  if (hr < 10) { hr = '0' + hr }

  if (min < 10) { min = '0' + min }

  time = hr + ':' + min;

  return time;
}

export const getFormattedDateTime = (timestamp = new Date()) => {
  /** Take datetime object and return string representation of time as 09:30 */
  let datetime = new Date(timestamp);

  let dd = datetime.getDate();
  let mm = datetime.getMonth() + 1; //January is 0!
  let yyyy = datetime.getFullYear();

  if (dd < 10) { dd = '0' + dd; }

  if (mm < 10) { mm = '0' + mm; }

  let date = yyyy + '-' + mm + '-' + dd;

  let hr = datetime.getHours();
  let min = datetime.getMinutes();
  let sec = datetime.getSeconds();

  if (hr < 10) hr = '0' + hr
  if (min < 10) min = '0' + min
  if (sec < 10) sec = '0' + sec

  let time = hr + ':' + min + ':' + sec;

  return date + ' ' + time;
}