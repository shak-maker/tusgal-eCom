'use client'

import { create } from 'zustand'

type CatalogState = {
	selectedCategoryId: string | null
	setSelectedCategoryId: (id: string | null) => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
	selectedCategoryId: null,
	setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}))


