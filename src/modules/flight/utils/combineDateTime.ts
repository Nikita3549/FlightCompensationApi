/**
 * @param date - "YYYY-MM-DD"
 * @param time - "HH:mm" or "HH:mm:ss"
 * @param mode - "utc" or "local"
 * @returns
 */
export function combineDateTime(
    date: string,
    time: string,
    mode: 'utc' | 'local' = 'utc',
): string {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;

    if (mode === 'utc') {
        return `${date}T${normalizedTime}Z`;
    } else {
        return `${date}T${normalizedTime}`;
    }
}
