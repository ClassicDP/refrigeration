export interface Dessert {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isOnSale?: boolean;
  image: string;
  description?: string;
  position: {
    row: number;
    col: number;
  };
}

export interface SelectedDessert extends Dessert {
  quantity: number;
}

export interface CartState {
  items: SelectedDessert[];
  totalPrice: number;
  totalItems: number;
}