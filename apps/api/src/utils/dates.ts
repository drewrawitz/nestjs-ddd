import dayjs from 'dayjs';

export const isDateBefore = (date1: Date, date2: Date) =>
  dayjs(date1).isBefore(date2);

export const isDateInFuture = (date: Date) =>
  dayjs(date).isAfter(new Date(Date.now()));
