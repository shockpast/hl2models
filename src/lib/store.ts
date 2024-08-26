import { writable } from 'svelte/store'

export const loadingProgress = writable<number>(0)