import React, { useState, useEffect } from 'react';
import { actions } from 'astro:actions';
import type { ProductInfo } from '@app/shared';

interface Props {
    product: ProductInfo;
}

const ProductActions: React.FC<Props> = ({ product }) => {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const result = await actions.favorite.check({
                    productId: +product.id,
                });
                if (result.data) {
                    setIsFavorited(result.data.favorited);
                }
            } catch (error) {
                console.error('Failed to check favorite status:', error);
            }
        };
        checkFavoriteStatus();
    }, [product.id]);

    const handleToggleFavorite = async () => {
        setIsTogglingFavorite(true);
        try {
            const result = await actions.favorite.toggle({
                productId: +product.id,
            });
            if (result.data) {
                setIsFavorited(result.data.favorited);
            } else if (result.error) {
                if (result.error.code === 'UNAUTHORIZED') {
                    alert('请先登录');
                    window.location.href = '/login';
                } else {
                    alert(result.error.message || '操作失败');
                }
            }
        } catch (error) {
            alert('操作失败');
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert('请选择尺码');
            return;
        }

        // 从规格中找到对应的SKU
        const sku = product.skus?.find((sku) => {
            // 检查规格中是否包含尺码信息
            if (sku.specs && Array.isArray(sku.specs)) {
                // 如果 specs 是数组，查找尺码
                const sizeSpec = sku.specs.find(
                    (spec: any) => spec.key === '尺码'
                );
                return sizeSpec && sizeSpec.value === selectedSize;
            } else if (sku.specs && typeof sku.specs === 'object') {
                // 如果 specs 是对象，直接查找尺码
                return (
                    sku.specs['尺码'] === selectedSize ||
                    sku.specs.size === selectedSize
                );
            }
            return false;
        });

        if (sku) {
            setIsAddingToCart(true);
            try {
                const result = await actions.cart.addToCart({
                    productId: +product.id,
                    skuId: +sku.id,
                    quantity: 1,
                });

                if (result.data?.success) {
                    alert('已添加到购物车');
                } else {
                    alert(result.error?.message || '添加失败');
                }
            } catch (error) {
                alert('添加到购物车失败');
            } finally {
                setIsAddingToCart(false);
            }
        } else {
            alert('未找到对应的SKU');
        }
    };

    // 从规格中提取尺码
    const getAvailableSizes = () => {
        if (!product.skus) return [];

        return product.skus
            .map((sku) => {
                if (Array.isArray(sku.specs)) {
                    const sizeSpec = sku.specs.find(
                        (spec: any) => spec.key === '尺码'
                    );
                    return sizeSpec ? sizeSpec.value : null;
                } else if (sku.specs && typeof sku.specs === 'object') {
                    return sku.specs['尺码'] || sku.specs.size || null;
                }
                return null;
            })
            .filter(Boolean);
    };

    const sizes = getAvailableSizes();

    return (
        <div className='space-y-10'>
            {/* Size Selection */}
            <div>
                <div className='flex justify-between items-center mb-4'>
                    <span className='font-bold'>选择尺码</span>
                    <button className='text-sm underline text-nike-dark-grey'>
                        尺码表
                    </button>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                    {sizes.map((size, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedSize(size as string)}
                            className={`border py-3 rounded transition-colors font-medium ${
                                selectedSize === size
                                    ? 'border-nike-black bg-nike-black text-white'
                                    : 'border-nike-grey hover:border-nike-black'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Call to Actions */}
            <div className='space-y-3'>
                <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className='py-5 w-full text-lg btn-nike-black disabled:opacity-50'
                >
                    {isAddingToCart ? '添加中...' : '加入购物车'}
                </button>
                <button
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className={`flex gap-2 justify-center items-center py-5 w-full text-lg btn-nike-outline disabled:opacity-50 ${isFavorited ? 'text-red-500 border-red-500 hover:bg-red-50' : ''}`}
                >
                    {isFavorited ? '已收藏' : '收藏'}
                    <svg
                        className='w-5 h-5'
                        fill={isFavorited ? 'currentColor' : 'none'}
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ProductActions;
