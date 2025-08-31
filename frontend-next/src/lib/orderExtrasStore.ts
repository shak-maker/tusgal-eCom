import { create } from "zustand";

// Make sure this imports the updated LensInfo with `material`
import { LensInfo } from "@/lib/types";

type OrderExtrasState = {
  buyingEyeglasses: boolean;
  lensInfo: LensInfo | null;
  setBuyingEyeglasses: (buying: boolean) => void;
  setLensInfo: (info: LensInfo | null) => void;
};

export const useOrderExtrasStore = create<OrderExtrasState>((set) => ({
  buyingEyeglasses: false,
  lensInfo: null,
  setBuyingEyeglasses: (buying) => {
    set({ buyingEyeglasses: buying });
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("buying_eyeglasses", JSON.stringify(buying));
      }
    } catch (e) {
      console.warn("Failed to save buyingEyeglasses to localStorage", e);
    }
  },
  setLensInfo: (info) => {
    set({ lensInfo: info });
    try {
      if (typeof window !== "undefined") {
        if (info !== null) {
          localStorage.setItem("lens_info", JSON.stringify(info));
        } else {
          localStorage.removeItem("lens_info");
        }
      }
    } catch (e) {
      console.warn("Failed to save lensInfo to localStorage", e);
    }
  },
}));

// Hydrate from localStorage
if (typeof window !== "undefined") {
  try {
    const buyingStr = localStorage.getItem("buying_eyeglasses");
    if (buyingStr) {
      const buying = JSON.parse(buyingStr);
      if (typeof buying === "boolean") {
        useOrderExtrasStore.setState({ buyingEyeglasses: buying });
      }
    }

    const raw = localStorage.getItem("lens_info");
    if (raw) {
      const saved = JSON.parse(raw);

      // 🔒 Type guard: Only restore valid LensInfo shape
      const isValid = (
        typeof saved === "object" &&
        saved !== null &&
        (saved.pdCm === undefined || typeof saved.pdCm === "number") &&
        (saved.leftVision === undefined || typeof saved.leftVision === "string") &&
        (saved.rightVision === undefined || typeof saved.rightVision === "string") &&
        (saved.notes === undefined || typeof saved.notes === "string") &&
        [
          undefined,
          null,
          "normal_white",
          "chameleon",
          "purple_chameleon",
        ].includes(saved.material)
      );

      if (isValid) {
        useOrderExtrasStore.setState({ lensInfo: saved });
      } else {
        console.warn("Invalid lens_info in localStorage, ignored", saved);
      }
    }
  } catch (e) {
    console.warn("Failed to hydrate order extras from localStorage", e);
  }
}