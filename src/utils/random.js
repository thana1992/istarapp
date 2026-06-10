// Shared random helpers for the seasonal theme overlays (particle generation).
// rand(a, b) → float in [a, b);  pick(arr) → a random element of arr.
export function rand(a, b) { return Math.random() * (b - a) + a; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
