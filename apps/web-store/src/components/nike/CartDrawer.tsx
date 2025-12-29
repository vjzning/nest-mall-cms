import React, { useState, useEffect } from 'react';
import { actions } from 'astro:actions';
import { useCart } from './CartContext';

interface CartItem {
    productId: number;
    skuId: number;
    quantity: number;
    name?: string;
    cover?: string;
    price?: number;
    totalPrice?: number;
}

const CartItemRow: React.FC<{
    item: CartItem;
    removeItem: (skuId: number) => void;
}> = ({ item, removeItem }) => {
    return (
        <div className='flex gap-4'>
            <div className='w-24 h-24 bg-nike-grey shrink-0'>
                {item.cover && (
                    <img
                        src={item.cover}
                        alt={item.name}
                        className='object-cover w-full h-full mix-blend-multiply'
                    />
                )}
            </div>
            <div className='flex-1'>
                <div className='flex justify-between mb-1 font-bold'>
                    <h4 className='text-sm tracking-tight uppercase'>
                        {item.name || '未知商品'}
                    </h4>
                    <p className='text-sm'>￥{item.totalPrice || 0}</p>
                </div>
                <p className='mb-4 text-xs text-nike-dark-grey'>
                    数量: {item.quantity}
                </p>
                <button
                    onClick={() => removeItem(item.skuId)}
                    className='text-xs underline text-nike-dark-grey hover:text-nike-black'
                >
                    移除
                </button>
            </div>
        </div>
    );
};

const CartDrawer: React.FC<{ initialData?: any }> = ({ initialData }) => {
    const { isOpen, closeCart } = useCart();
    const [items, setItems] = useState<CartItem[]>(
        initialData?.cartItems || []
    );
    const [loading, setLoading] = useState(!initialData);
    const [total, setTotal] = useState(initialData?.total || 0);

    // 获取购物车数据
    useEffect(() => {
        if (isOpen) {
            fetchCartData();
        }
    }, [isOpen]);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            const result = await actions.cart.getCart(formData);

            if (result.data?.success) {
                setItems(result.data.cartItems || []);
                setTotal(result.data.total || 0);
            }
        } catch (error) {
            console.error('获取购物车数据失败:', error);
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (skuId: number) => {
        try {
            const formData = new FormData();
            formData.append('skuId', skuId.toString());
            formData.append('quantity', '0'); // 设置为0即删除

            const result = await actions.cart.updateCartItem(formData);

            if (result.data?.success) {
                setItems(result.data.cartItems || []);
                setTotal(result.data.total || 0);
            }
        } catch (error) {
            console.error('删除购物车商品失败:', error);
        }
    };

    // Prevent scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className='flex fixed inset-0 justify-end z-100'>
            {/* Backdrop */}
            <div
                className='absolute inset-0 transition-opacity bg-black/50'
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className='flex relative flex-col w-full max-w-md h-full bg-white shadow-2xl animate-slide-in-right'>
                <div className='flex justify-between items-center p-6 border-b border-nike-grey'>
                    <h2 className='text-xl italic font-bold tracking-tighter uppercase'>
                        我的购物袋
                    </h2>
                    <button
                        onClick={closeCart}
                        className='p-2 rounded-full hover:bg-nike-grey'
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
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                <div className='overflow-y-auto flex-1 p-6'>
                    {loading ? (
                        <div className='flex flex-col justify-center items-center h-full text-nike-dark-grey'>
                            <p>加载中...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className='flex flex-col justify-center items-center h-full text-nike-dark-grey'>
                            <p className='mb-4'>您的购物袋中还没有商品。</p>
                            <button
                                onClick={closeCart}
                                className='btn-nike-black'
                            >
                                去逛逛
                            </button>
                        </div>
                    ) : (
                        <div className='space-y-6'>
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.skuId}
                                    item={item}
                                    removeItem={removeItem}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {!loading && items.length > 0 && (
                    <div className='p-6 space-y-4 border-t border-nike-grey'>
                        <div className='flex justify-between items-center font-bold'>
                            <span>总额</span>
                            <span className='text-lg'>￥{total}</span>
                        </div>
                        <p className='text-xs text-nike-dark-grey'>
                            订单满 ￥399 即可享受免运费及七天无理由退货。
                        </p>
                        <div className='space-y-2'>
                            <a 
                                href="/checkout"
                                className='block py-4 w-full text-center font-bold tracking-tight uppercase btn-nike-black'
                            >
                                去结算
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
