export function formatDate(
    date: Date,
    format:
        | 'dd.mm.yyyy'
        | 'mm/dd/yyyy'
        | 'yyyy-mm-dd'
        | 'dd mmm yyyy'
        | 'dd-yy'
        | 'dd-mm-yyyy' = 'dd.mm.yyyy',
): string {
    const d = date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (format) {
        case 'mm/dd/yyyy':
            return `${month}/${day}/${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${month}-${day}`;
        case 'dd mmm yyyy':
            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];
            return `${day} ${monthNames[d.getMonth()]} ${year}`;
        case 'dd-yy':
            return `${day}-${String(year).slice(-2)}`;
        case 'dd-mm-yyyy':
            return `${day}-${month}-${year}`;
        case 'dd.mm.yyyy':
        default:
            return `${day}.${month}.${year}`;
    }
}
