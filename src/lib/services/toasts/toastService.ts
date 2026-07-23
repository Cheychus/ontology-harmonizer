import { toast, type SvelteToastOptions } from "@zerodevx/svelte-toast"

export const success = (m: string) => toast.push(m, {
    classes: ["success"],
})

export const warning = (m: string, options?: SvelteToastOptions) => toast.push(m, {
    classes: ["warning"],
    ...options,
})

export const failure = (m: string) => toast.push(m, {
    classes: ["failure"],
})

