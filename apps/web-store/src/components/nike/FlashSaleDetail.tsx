import React, { useState, useEffect } from 'react';
import { actions } from 'astro:actions';

interface FlashSaleProduct {
    id: number;
    productId: number;
    skuId: number;
    flashPrice: string;
    stock: number;
    sales: number;
    limitPerUser: number;
    product?: any;
    sku?: any;
}

interface Props {
    activity: any;
    products: FlashSaleProduct[];
    addresses: any[];
}

const FlashSaleDetail: React.FC<Props> = ({
    activity,
    products,
    addresses,
}) => {
    const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
        addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || null
    );
    const [timeLeft, setTimeLeft] = useState<{
        d: number;
        h: number;
        m: number;
        s: number;
    } | null>(null);
    const [isOrdering, setIsOrdering] = useState(false);

    const status = (() => {
        const now = new Date();
        const start = new Date(activity.startTime);
        const end = new Date(activity.endTime);
        if (now < start) return 'COMING_SOON';
        if (now > end) return 'FINISHED';
        return 'ONGOING';
    })();

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target =
                status === 'COMING_SOON'
                    ? new Date(activity.startTime).getTime()
                    : new Date(activity.endTime).getTime();

            const distance = target - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                ),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activity, status]);

    const handleOrder = async () => {
        if (!selectedSkuId) {
            alert('请选择商品规格');
            return;
        }
        if (!selectedAddressId) {
            alert('请选择收货地址');
            return;
        }

        setIsOrdering(true);
        try {
            const { data, error } = await actions.flashSale.createOrder({
                activityId: Number(activity.id),
                skuId: Number(selectedSkuId),
                addressId: Number(selectedAddressId),
            });

            if (error) throw error;

            alert(data.message || '抢购成功，正在处理订单...');
            setTimeout(() => {
                window.location.href = '/member/orders';
            }, 2000);
        } catch (err: any) {
            alert(err.message || '抢购失败，请稍后重试');
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            {/* Left: Banner and Info */}
            <div className='space-y-8'>
                <div className='aspect-[16/9] bg-nike-grey rounded-lg overflow-hidden'>
                    <img
                        src={
                            activity.bannerUrl ||
                            '/images/placeholder-banner.jpg'
                        }
                        className='w-full h-full object-cover'
                        alt={activity.title}
                    />
                </div>
                <div>
                    <h1 className='text-4xl font-black uppercase italic tracking-tighter mb-4'>
                        {activity.title}
                    </h1>
                    <p className='text-nike-dark-grey leading-relaxed'>
                        {activity.remark}
                    </p>
                </div>

                {/* Countdown */}
                <div className='bg-nike-black text-white p-8 rounded-lg text-center'>
                    <h3 className='text-sm font-bold uppercase tracking-widest mb-4'>
                        {status === 'COMING_SOON'
                            ? '距离开始还有'
                            : status === 'ONGOING'
                              ? '距离结束还有'
                              : '活动已结束'}
                    </h3>
                    {timeLeft && (
                        <div className='flex justify-center gap-6'>
                            {[
                                { label: '天', value: timeLeft.d },
                                { label: '时', value: timeLeft.h },
                                { label: '分', value: timeLeft.m },
                                { label: '秒', value: timeLeft.s },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className='text-4xl md:text-5xl font-nike font-black italic'>
                                        {String(item.value).padStart(2, '0')}
                                    </div>
                                    <div className='text-xs uppercase mt-2 opacity-60 font-bold'>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Products and Checkout */}
            <div className='space-y-10'>
                <div>
                    <h2 className='text-xl font-bold uppercase italic mb-6'>
                        选择抢购商品
                    </h2>
                    <div className='grid gap-4'>
                        {products.map((p) => {
                            const isSelected = selectedSkuId === p.skuId;
                            const specs = p.sku?.specs;
                            const size = Array.isArray(specs)
                                ? specs.find((s: any) => s.key === '尺码')
                                      ?.value
                                : specs?.['尺码'] || specs?.size;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() =>
                                        p.stock > 0 && setSelectedSkuId(p.skuId)
                                    }
                                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                                        p.stock <= 0
                                            ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                            : isSelected
                                              ? 'border-nike-black ring-1 ring-nike-black bg-white'
                                              : 'border-nike-grey hover:border-gray-400 bg-white'
                                    }`}
                                >
                                    <div className='w-20 h-20 bg-nike-grey rounded overflow-hidden flex-shrink-0'>
                                        <img
                                            src={p.product?.cover}
                                            className='w-full h-full object-cover'
                                            alt={p.product?.name}
                                        />
                                    </div>
                                    <div className='flex-grow min-w-0'>
                                        <h4 className='font-bold truncate'>
                                            {p.product?.name}
                                        </h4>
                                        <p className='text-sm text-nike-dark-grey'>
                                            尺码: {size || '默认'}
                                        </p>
                                        <div className='mt-1 flex items-center gap-3'>
                                            <span className='text-red-600 font-bold italic'>
                                                ￥{p.flashPrice}
                                            </span>
                                            <span className='text-xs text-nike-dark-grey line-through'>
                                                ￥{p.sku?.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='text-right flex-shrink-0'>
                                        <div className='text-xs font-bold uppercase mb-1'>
                                            库存: {p.stock}
                                        </div>
                                        {p.stock <= 0 && (
                                            <span className='text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold'>
                                                已抢光
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Address Selection */}
                <div>
                    <h2 className='text-xl font-bold uppercase italic mb-6'>
                        收货地址
                    </h2>
                    {addresses.length === 0 ? (
                        <div className='p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm'>
                            暂无收货地址，请先到{' '}
                            <a
                                href='/member/address/new'
                                className='underline font-bold'
                            >
                                个人中心添加
                            </a>
                        </div>
                    ) : (
                        <select
                            value={selectedAddressId || ''}
                            onChange={(e) =>
                                setSelectedAddressId(Number(e.target.value))
                            }
                            className='w-full p-4 border border-nike-grey rounded-lg font-medium outline-none focus:border-nike-black'
                        >
                            {addresses.map((addr) => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.receiverName} - {addr.receiverPhone} (
                                    {addr.addressLine1})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Buy Button */}
                <div className='pt-8 border-t border-nike-grey'>
                    <button
                        onClick={handleOrder}
                        disabled={isOrdering}
                        className={`w-full py-6 text-xl font-nike font-black uppercase italic rounded-full transition-all shadow-2xl active:scale-95 ${
                            status === 'ONGOING' && !isOrdering
                                ? 'bg-nike-black text-white hover:bg-red-600'
                                : 'bg-nike-grey text-nike-dark-grey cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isOrdering
                            ? '正在处理...'
                            : status === 'COMING_SOON'
                              ? '尚未开始'
                              : status === 'FINISHED'
                                ? '活动已结束'
                                : !selectedSkuId
                                  ? '请选择商品规格'
                                  : '立即抢购'}
                    </button>

                    <p className='mt-5 text-center text-[10px] text-nike-black uppercase font-black tracking-[0.2em]'>
                        {status === 'ONGOING'
                            ? '抢购成功后请在 15 分钟内完成支付'
                            : '请关注活动开始时间'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FlashSaleDetail;
