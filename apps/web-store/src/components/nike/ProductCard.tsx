import React from 'react';
import type { ProductInfo } from '@app/shared';

interface Props {
  product: ProductInfo;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <div className="group cursor-pointer relative">
      <a href={`/product/${product.id}`} className="block">
        <div className="aspect-square bg-[#F6F6F6] overflow-hidden relative">
          <img
            src={product.cover}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
        </div>
        <div className="mt-4 space-y-0.5 px-1">
          <h3 className="font-medium text-nike-black truncate">{product.name}</h3>
          <p className="text-nike-dark-grey text-sm">男子运动鞋</p>
          <p className="font-bold text-nike-black mt-2">￥{product.price || '待定'}</p>
        </div>
      </a>

      {/* Hover Action Overlay - Separate from the main link to avoid nested anchors */}
      <div className="absolute inset-x-0 bottom-[104px] p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-center pointer-events-none">
        <button
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            // TODO: Connect to cart store if needed for quick add
          }}
          className="bg-white text-nike-black px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-nike-grey transition-colors pointer-events-auto"
        >
          快速加入购物车
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
