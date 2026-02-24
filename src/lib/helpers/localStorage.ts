import { browser } from "$app/environment";

export function toLocalStorage<T>(key: string, value: T) {
    if (!browser) {
        return;
    }
    const objStr = JSON.stringify(value);
    window.localStorage.setItem(key, objStr);
}

export function fromLocalStorage<T>(key: string): T | null {
    if (!browser) {
        return null;
    }
    const obj = window.localStorage.getItem(key);
    if (obj) {
        return JSON.parse(obj) as T;
    } else {
        return null;
    }
}

export function removeItem(key: string) {
    if (!browser) {
        return;
    }

    window.localStorage.removeItem(key);
}