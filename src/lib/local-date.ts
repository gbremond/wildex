const twoDigits = (value: number) => String(value).padStart(2, '0');

/** `YYYY-MM-DD` in the user's time zone, as a date input expects. */
export function localDay(date: Date): string {
	return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

/** `YYYY-MM-DDTHH:mm` in the user's time zone, as a datetime-local input expects. */
export function localDateTime(date: Date): string {
	return `${localDay(date)}T${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}
