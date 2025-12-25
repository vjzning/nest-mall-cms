import React from 'react';
import { useCartStore } from '../../store/cart';

const CartButton: React.FC = () => {
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((acc: number, item) => acc + item.quantity, 0);

  return (
    <button
      onClick={() => toggleCart(true)}
      className="p-2 hover:bg-nike-grey rounded-full relative"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 bg-nike-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;
