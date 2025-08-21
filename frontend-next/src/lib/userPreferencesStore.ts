'use client'

import { create } from 'zustand'

type UserPreferencesState = {
	pdCm: number | null
	setPdCm: (value: number | null) => void
}

export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
	pdCm: null,
	setPdCm: (value) => {
		set({ pdCm: value })
		try {
			if (typeof window !== 'undefined') {
				if (value === null || Number.isNaN(value)) {
					localStorage.removeItem('user_pd_cm')
				} else {
					localStorage.setItem('user_pd_cm', String(value))
				}
			}
		} catch {}
	},
}))

// Hydrate from localStorage on module load (client only)
if (typeof window !== 'undefined') {
	try {
		const stored = localStorage.getItem('user_pd_cm')
		if (stored) {
			const parsed = parseFloat(stored)
			if (!Number.isNaN(parsed)) {
				useUserPreferencesStore.getState().setPdCm(parsed)
			}
		}
	} catch {}
}


