import { create } from "zustand";

export interface SelectedOption {
  groupId:    string;
  groupName:  string;
  optionId:   string;
  optionName: string;
  extraPrice: number;
}

export interface CartItem {
  menuId:   string;
  menuName: string;
  price:    number;
  quantity: number;
  image:    string;
  options?: SelectedOption[];
}

interface StoreInfo {
  storeId: string;
  storeName: string;
  storeEmoji: string;
  deliveryFee: number;
  minOrderAmount: number;
  pickRewardRate: number;
}

interface CartState extends StoreInfo {
  items: CartItem[];

  // 계산
  totalCount: () => number;
  itemsAmount: () => number; // 배달비 제외 메뉴 합계

  // 액션
  addItem: (storeInfo: StoreInfo, item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, delta: number) => void;
  clearCart: () => void;
}

const EMPTY_STORE: StoreInfo = {
  storeId: "",
  storeName: "",
  storeEmoji: "",
  deliveryFee: 0,
  minOrderAmount: 0,
  pickRewardRate: 0,
};

export const useCartStore = create<CartState>((set, get) => ({
  ...EMPTY_STORE,
  items: [],

  totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  itemsAmount: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  addItem: (storeInfo, newItem) => {
    const { storeId, items } = get();

    // 다른 가게 담으면 초기화
    const baseItems = storeId && storeId !== storeInfo.storeId ? [] : items;

    const existing = baseItems.find((i) => i.menuId === newItem.menuId);
    const updated = existing
      ? baseItems.map((i) =>
          i.menuId === newItem.menuId ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...baseItems, { ...newItem, quantity: 1 }];

    set({ ...storeInfo, items: updated });
  },

  removeItem: (menuId) => {
    set((s) => ({
      items: s.items.filter((i) => i.menuId !== menuId),
    }));
  },

  updateQuantity: (menuId, delta) => {
    set((s) => ({
      items: s.items
        .map((i) =>
          i.menuId === menuId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0),
    }));
  },

  clearCart: () => set({ ...EMPTY_STORE, items: [] }),
}));
