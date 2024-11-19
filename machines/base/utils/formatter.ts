
const fulldays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (someDateTimeStamp: number) => {
  let dt = new Date(someDateTimeStamp),
    date = dt.getDate(),
    month = months[dt.getMonth()],
    diffDays = new Date().getDate() - date,
    diffMonths = new Date().getMonth() - dt.getMonth(),
    diffYears = new Date().getFullYear() - dt.getFullYear();

  if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
    return "today";
  } else if (diffYears === 0 && diffDays === 1) {
    return "yesterday";
  } else if (diffYears === 0 && diffDays === -1) {
    return "tomorrow";
  } else if (diffYears === 0 && (diffDays < -1 && diffDays > -7)) {
    return fulldays[dt.getDay()];
  } else if (diffYears >= 1) {
    return month + " " + date + ", " + new Date(someDateTimeStamp).getFullYear();
  } else {
    return month + " " + date;
  }
}

function formatTime(ms: number) {
  return new Date(ms).toTimeString().substring(0, 5)
}

export default {
    formatDate,
    formatTime
}