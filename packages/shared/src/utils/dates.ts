import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export const isDateBefore = (date1: Date, date2: Date) =>
  dayjs(date1).isBefore(date2);

export const isDateInFuture = (date: Date) =>
  dayjs(date).isAfter(new Date(Date.now()));

export const formattedDate = (date: Date, format = "LL") => {
  return dayjs(date).format(format);
};
