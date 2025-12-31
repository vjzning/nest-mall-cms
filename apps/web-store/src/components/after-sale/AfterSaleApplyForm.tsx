import React, { useState } from 'react';
import { actions } from 'astro:actions';

interface Props {
    order: any;
    orderItemId: number;
}

export default function AfterSaleApplyForm({ order, orderItemId }: Props) {
    const item = order.items?.find(
        (i: any) => Number(i.id) === Number(orderItemId)
    );

    const [type, setType] = useState<'REFUND' | 'RETURN_REFUND' | 'EXCHANGE'>(
        'REFUND'
    );
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(item?.quantity || 1);
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!item) {
        return (
            <div className='p-4 text-red-600 bg-red-50 rounded'>
                未找到相关商品信息
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            setError('请选择申请原因');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // 映射售后类型到后端枚举值 (1: 仅退款, 2: 退货退款, 3: 换货)
        const typeMap = {
            REFUND: 1,
            RETURN_REFUND: 2,
            EXCHANGE: 3,
        };

        try {
            const { data, error: actionError } = await actions.afterSale.apply({
                orderId: Number(order.id),
                type: typeMap[type] as any,
                applyReason: reason,
                description,
                images,
                items: [
                    {
                        orderItemId: Number(item.id),
                        quantity,
                    },
                ],
            });

            if (actionError) {
                throw new Error(actionError.message);
            }

            // 成功后跳转到售后列表
            window.location.href = '/member/after-sale';
        } catch (err: any) {
            setError(err.message || '申请提交失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    const reasons = [
        '商品质量问题',
        '七天无理由退换',
        '尺码/规格不符',
        '发错货/漏发',
        '物流问题',
        '其他',
    ];

    return (
        <form onSubmit={handleSubmit} className='space-y-8'>
            {/* 商品信息 */}
            <section>
                <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                    售后商品
                </h4>
                <div className='flex gap-4 p-4 rounded-lg bg-nike-grey/20'>
                    <img
                        src={item.productImg}
                        alt={item.productName}
                        className='object-cover w-20 h-20 bg-white rounded'
                    />
                    <div className='flex-1'>
                        <h5 className='font-bold'>{item.productName}</h5>
                        <p className='mt-1 text-sm text-nike-dark-grey'>
                            单价: ¥{item.price} | 购买数量: {item.quantity}
                        </p>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <span className='text-sm font-medium'>申请数量</span>
                        <select
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Number(e.target.value))
                            }
                            className='p-1 rounded border outline-none border-nike-grey focus:ring-1 focus:ring-nike-black'
                        >
                            {Array.from({ length: item.quantity }).map(
                                (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>
            </section>

            {/* 售后类型 */}
            <section>
                <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                    服务类型
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    {[
                        {
                            id: 'REFUND',
                            label: '仅退款',
                            desc: '未收到货，或协商退款',
                        },
                        {
                            id: 'RETURN_REFUND',
                            label: '退货退款',
                            desc: '已收到货，需退货退款',
                        },
                        {
                            id: 'EXCHANGE',
                            label: '换货',
                            desc: '商品有误，需更换规格',
                        },
                    ].map((t) => (
                        <button
                            key={t.id}
                            type='button'
                            onClick={() => setType(t.id as any)}
                            className={`p-4 text-left border rounded-lg transition-all ${
                                type === t.id
                                    ? 'border-nike-black bg-nike-black text-white'
                                    : 'border-nike-grey hover:border-nike-black'
                            }`}
                        >
                            <p className='font-bold'>{t.label}</p>
                            <p
                                className={`mt-1 text-xs ${type === t.id ? 'text-white/80' : 'text-nike-dark-grey'}`}
                            >
                                {t.desc}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {/* 申请原因 */}
            <section>
                <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                    申请原因
                </h4>
                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className='p-3 w-full rounded border outline-none border-nike-grey focus:ring-1 focus:ring-nike-black'
                    required
                >
                    <option value=''>请选择申请原因</option>
                    {reasons.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </section>

            {/* 详细描述 */}
            <section>
                <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                    补充描述
                </h4>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='请详细描述您的问题，以便我们更快处理...'
                    className='p-3 w-full h-32 rounded border outline-none resize-none border-nike-grey focus:ring-1 focus:ring-nike-black'
                />
            </section>

            {/* 图片上传 (简化版，仅支持输入 URL) */}
            <section>
                <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                    凭证图片
                </h4>
                <div className='space-y-3'>
                    <p className='text-xs text-nike-dark-grey'>
                        请输入图片 URL (最多3张)
                    </p>
                    {[0, 1, 2].map((i) => (
                        <input
                            key={i}
                            type='text'
                            placeholder={`图片 URL ${i + 1}`}
                            className='p-2 w-full text-sm rounded border outline-none border-nike-grey focus:ring-1 focus:ring-nike-black'
                            onChange={(e) => {
                                const newImages = [...images];
                                newImages[i] = e.target.value;
                                setImages(newImages.filter((url) => !!url));
                            }}
                        />
                    ))}
                </div>
            </section>

            <div className='pt-6'>
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='py-4 w-full font-bold text-white rounded transition-colors bg-nike-black hover:bg-gray-800 disabled:bg-nike-dark-grey'
                >
                    {isSubmitting ? '提交中...' : '提交申请'}
                </button>

                {error && (
                    <div className='p-4 mt-4 text-sm text-red-600 bg-red-50 rounded border border-red-200'>
                        {error}
                    </div>
                )}
            </div>
        </form>
    );
}
