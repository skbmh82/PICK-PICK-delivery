import { create } from "zustand";

export interface PlacedOrderItem {
  menuName: string;
  quantity: number;
  price: number;
}

export interface PlacedOrder {
  orderId: string;
  storeName: string;
  storeEmoji: string;
  items: PlacedOrderItem[];
  itemsAmount: number;
  deliveryFee: number;
  pickUsed: number;
  pickReward: number;
  totalPaid: number;
  deliveryAddress: string;
  estimatedMinutes: number;
  placedAt: string; // HH:MM
}

interface OrderState {
  lastOrder: PlacedOrder | null;
  setLastOrder: (order: PlacedOrder) => void;
  clearLastOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  lastOrder: null,
  setLastOrder: (order) => set({ lastOrder: order }),
  clearLastOrder: () => set({ lastOrder: null }),
}));
