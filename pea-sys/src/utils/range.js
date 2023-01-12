export function numberRange(start, end, close = false) {
    return new Array(end - start + (close ? 1 : 0))
        .fill().map((_, i) => i + start);
}

export function alphabetRange(start, end, close = false) {
    return new Array(end.charCodeAt(0) - start.charCodeAt(0) + (close ? 1 : 0))
        .fill().map((_, i) => String.fromCharCode(i + start.charCodeAt(0)));
}