'use client'

import { create } from 'zustand'

export type LensInfo = {
	pdCm?: number
	leftVision?: string
	rightVision?: string
	notes?: string
}

type OrderExtrasState = {
	buyingEyeglasses: boolean
	lensInfo: LensInfo | null
	setBuyingEyeglasses: (buying: boolean) => void
	setLensInfo: (info: LensInfo | null) => void
}

export const useOrderExtrasStore = create<OrderExtrasState>((set) => ({
	buyingEyeglasses: false,
	lensInfo: null,
	setBuyingEyeglasses: (buying) => {
		set({ buyingEyeglasses: buying })
		try {
			if (typeof window !== 'undefined') {
				localStorage.setItem('buying_eyeglasses', JSON.stringify(buying))
			}
		} catch {}
	},
	setLensInfo: (info) => {
		set({ lensInfo: info })
		try {
			if (typeof window !== 'undefined') {
				if (info) {
					localStorage.setItem('lens_info', JSON.stringify(info))
				} else {
					localStorage.removeItem('lens_info')
				}
			}
		} catch {}
	},
}))

// Hydrate from localStorage
if (typeof window !== 'undefined') {
	try {
		const buying = localStorage.getItem('buying_eyeglasses')
		if (buying) {
			useOrderExtrasStore.setState({ buyingEyeglasses: JSON.parse(buying) })
		}
		const raw = localStorage.getItem('lens_info')
		if (raw) {
			useOrderExtrasStore.setState({ lensInfo: JSON.parse(raw) })
		}
	} catch {}
}


