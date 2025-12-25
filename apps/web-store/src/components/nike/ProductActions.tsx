import React, { useState } from 'react';
import { useCartStore } from '../../store/cart';
import type { ProductInfo } from '@app/shared';

interface Props {
  product: ProductInfo;
}

const ProductActions: React.FC<Props> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('请选择尺码');
      return;
    }
    const sku = product.skus?.find(s => s.specs.size === selectedSize);
    if (sku) {
      addItem(product, sku.id);
    }
  };

  return (
    <div className="space-y-10">
      {/* Size Selection */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold">选择尺码</span>
          <button className="text-nike-dark-grey underline text-sm">尺码表</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {product.skus?.map(sku => (
            <button
              key={sku.id}
              onClick={() => setSelectedSize(sku.specs.size)}
              className={`border py-3 rounded transition-colors font-medium ${selectedSize === sku.specs.size
                ? 'border-nike-black bg-nike-black text-white'
                : 'border-nike-grey hover:border-nike-black'
                }`}
            >
              {sku.specs.size}
            </button>
          ))}
        </div>
      </div>

      {/* Call to Actions */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          className="w-full btn-nike-black py-5 text-lg"
        >
          加入购物车
        </button>
        <button className="w-full btn-nike-outline py-5 text-lg flex items-center justify-center gap-2">
          收藏
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
