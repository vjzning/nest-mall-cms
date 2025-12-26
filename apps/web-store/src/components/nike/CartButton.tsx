import React, { useState, useEffect } from 'react';
import { actions } from 'astro:actions';
import { CartProvider, useCart } from './CartContext';
import CartDrawer from './CartDrawer';

const CartButton: React.FC<{ initialCount?: number }> = ({
    initialCount = 0,
}) => {
    const { openCart } = useCart();
    const [itemCount, setItemCount] = useState(initialCount);
    const [loading, setLoading] = useState(!initialCount);

    // 从 session 获取购物车数据
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const formData = new FormData();
                const result = await actions.cart.getCart(formData);

                if (result.data?.success) {
                    setItemCount(result.data.count || 0);
                }
            } catch (error) {
                console.error('获取购物车数据失败:', error);
                setItemCount(0);
            } finally {
                setLoading(false);
            }
        };

        const handleCartUpdate = () => {
            fetchCartData();
        };

        // 在客户端执行，因为需要浏览器环境
        if (typeof window !== 'undefined') {
            fetchCartData();
            window.addEventListener('cart-updated', handleCartUpdate);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('cart-updated', handleCartUpdate);
            }
        };
    }, []);

    return (
        <button
            onClick={openCart}
            className='relative p-2 rounded-full hover:bg-nike-grey'
        >
            <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                />
            </svg>
            {!loading && itemCount > 0 && (
                <span className='absolute top-1 right-1 bg-nike-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold'>
                    {itemCount}
                </span>
            )}
        </button>
    );
};

export const Cart: React.FC<{ initialData?: any }> = ({ initialData }) => {
    return (
        <CartProvider>
            <CartButton initialCount={initialData?.count} />
            <CartDrawer initialData={initialData} />
        </CartProvider>
    );
};

export default CartButton;
