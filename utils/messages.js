import datefns from 'date-fns';

export function formatMessage(username, text) {
  return {
    username,
    text,
    time: datefns.format(new Date(), 'h:mm a')
  }
}
