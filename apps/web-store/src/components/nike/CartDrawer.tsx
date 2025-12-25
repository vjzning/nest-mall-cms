import React, { useEffect } from 'react';
import { useCartStore } from '../../store/cart';

const CartDrawer: React.FC = () => {
  const { items, isOpen, toggleCart, removeItem } = useCartStore();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = items.reduce((acc: number, item) => acc + (item.product.price || 0) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => toggleCart(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 flex items-center justify-between border-b border-nike-grey">
          <h2 className="text-xl font-bold uppercase italic tracking-tighter">我的购物袋</h2>
          <button
            onClick={() => toggleCart(false)}
            className="p-2 hover:bg-nike-grey rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-nike-dark-grey">
              <p className="mb-4">您的购物袋中还没有商品。</p>
              <button
                onClick={() => toggleCart(false)}
                className="btn-nike-black"
              >
                去逛逛
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.skuId} className="flex gap-4">
                  <div className="w-24 h-24 bg-nike-grey shrink-0">
                    <img
                      src={item.product.cover}
                      alt={item.product.name}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between font-bold mb-1">
                      <h4 className="text-sm uppercase tracking-tight">{item.product.name}</h4>
                      <p className="text-sm">￥{(item.product.price || 0) * item.quantity}</p>
                    </div>
                    <p className="text-xs text-nike-dark-grey mb-4">数量: {item.quantity}</p>
                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="text-xs text-nike-dark-grey underline hover:text-nike-black"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-nike-grey space-y-4">
            <div className="flex justify-between items-center font-bold">
              <span>总额</span>
              <span className="text-lg">￥{total}</span>
            </div>
            <p className="text-xs text-nike-dark-grey">
              订单满 ￥399 即可享受免运费及七天无理由退货。
            </p>
            <div className="space-y-2">
              <button className="w-full btn-nike-black py-4 uppercase font-bold tracking-tight">
                去结算
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
