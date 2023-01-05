export function diffDay(target) {
    return Math.round((this - target) / (1000 * 60 * 60 * 24));
}

export function diffYear(target) {
    return Math.abs(new Date(this - target).getUTCFullYear() - 1970);
}

export function toRepublicYear() {
    return new Date(this.getFullYear() - 1911, this.getMonth(), this.getDate());
}

export function toCE() {
    return new Date(this.getFullYear() + 1911, this.getMonth(), this.getDate())
}