import React, { useState } from 'react';
import { actions } from 'astro:actions';

interface Props {
    afterSale: any;
}

export default function AfterSaleDetailView({ afterSale }: Props) {
    const [carrier, setCarrier] = useState('');
    const [trackingNo, setTrackingNo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            APPLIED: '已提交申请，等待平台审核',
            APPROVED: '审核通过，请提交退货物流',
            REJECTED: '申请已被拒绝',
            WAITING_RECEIPT: '平台待收货',
            PROCESSING: '平台处理中',
            COMPLETED: '售后已完成',
            CANCELLED: '售后已取消',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPLIED':
                return 'text-blue-600';
            case 'APPROVED':
                return 'text-green-600';
            case 'REJECTED':
                return 'text-red-600';
            case 'COMPLETED':
                return 'text-gray-900';
            default:
                return 'text-nike-black';
        }
    };

    const handleSubmitLogistics = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!carrier || !trackingNo) {
            setError('请填写完整的物流信息');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { data, error: actionError } =
                await actions.afterSale.submitLogistics({
                    id: afterSale.id.toString(),
                    carrier,
                    trackingNo,
                });

            if (actionError) {
                throw new Error(actionError.message);
            }

            window.location.reload();
        } catch (err: any) {
            setError(err.message || '提交失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeLabel = (type: number) => {
        const typeMap: Record<number, string> = {
            1: '仅退款',
            2: '退货退款',
            3: '换货',
        };
        return typeMap[type] || type;
    };

    const showLogisticsForm =
        afterSale.status === 'APPROVED' &&
        (afterSale.type === 2 || afterSale.type === 3) &&
        (!afterSale.logistics || afterSale.logistics.length === 0);

    return (
        <div className='space-y-8'>
            {/* 状态看板 */}
            <div className='p-8 text-white rounded-lg bg-nike-black'>
                <p className='text-sm opacity-80'>售后单状态</p>
                <p className='mt-2 text-2xl font-bold'>
                    {getStatusLabel(afterSale.status)}
                </p>
                {afterSale.adminRemark && (
                    <div className='mt-4 p-3 bg-white/10 rounded text-sm'>
                        <span className='font-bold'>商家备注：</span>
                        {afterSale.adminRemark}
                    </div>
                )}
            </div>

            {/* 填写物流 */}
            {showLogisticsForm && (
                <section className='p-6 border-2 border-dashed border-nike-black rounded-lg'>
                    <h4 className='mb-4 text-lg font-bold'>填写退货物流</h4>
                    <form
                        onSubmit={handleSubmitLogistics}
                        className='space-y-4'
                    >
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <div>
                                <label className='block mb-1 text-xs font-bold uppercase text-nike-dark-grey'>
                                    快递公司
                                </label>
                                <input
                                    type='text'
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    placeholder='如：顺丰速运'
                                    className='w-full p-3 border rounded border-nike-grey focus:ring-1 focus:ring-nike-black outline-none'
                                />
                            </div>
                            <div>
                                <label className='block mb-1 text-xs font-bold uppercase text-nike-dark-grey'>
                                    快递单号
                                </label>
                                <input
                                    type='text'
                                    value={trackingNo}
                                    onChange={(e) =>
                                        setTrackingNo(e.target.value)
                                    }
                                    placeholder='请输入单号'
                                    className='w-full p-3 border rounded border-nike-grey focus:ring-1 focus:ring-nike-black outline-none'
                                />
                            </div>
                        </div>
                        {error && (
                            <p className='text-sm text-red-600'>{error}</p>
                        )}
                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className='px-8 py-3 font-bold text-white transition-colors rounded bg-nike-black hover:bg-gray-800 disabled:bg-nike-dark-grey'
                        >
                            {isSubmitting ? '提交中...' : '确认提交'}
                        </button>
                    </form>
                </section>
            )}

            {/* 物流信息 */}
            {afterSale.logistics && afterSale.logistics.length > 0 && (
                <section>
                    <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                        物流信息
                    </h4>
                    <div className='space-y-4'>
                        {afterSale.logistics.map((log: any) => (
                            <div
                                key={log.id}
                                className='p-4 bg-nike-grey/20 rounded-lg space-y-2 text-sm'
                            >
                                <div className='flex justify-between'>
                                    <span className='text-nike-dark-grey'>
                                        物流类型
                                    </span>
                                    <span className='font-medium'>
                                        {log.type === 1
                                            ? '用户寄回'
                                            : '商家补发'}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-nike-dark-grey'>
                                        快递公司
                                    </span>
                                    <span className='font-medium'>
                                        {log.carrier}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-nike-dark-grey'>
                                        快递单号
                                    </span>
                                    <span className='font-medium'>
                                        {log.trackingNo}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-nike-dark-grey'>
                                        填写时间
                                    </span>
                                    <span className='font-medium'>
                                        {new Date(
                                            log.createdAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 基本信息 */}
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                <section>
                    <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                        申请信息
                    </h4>
                    <div className='space-y-3 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                售后单号
                            </span>
                            <span className='font-medium'>
                                {afterSale.afterSaleNo}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                关联订单
                            </span>
                            <span className='font-medium'>
                                {afterSale.orderNo}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                服务类型
                            </span>
                            <span className='font-bold'>
                                {getTypeLabel(afterSale.type)}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                申请原因
                            </span>
                            <span className='font-medium'>
                                {afterSale.applyReason}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                申请时间
                            </span>
                            <span className='font-medium'>
                                {new Date(afterSale.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                        退款信息
                    </h4>
                    <div className='space-y-3 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                申请退款金额
                            </span>
                            <span className='font-bold'>
                                ¥{afterSale.applyAmount}
                            </span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-nike-dark-grey'>
                                实际退款金额
                            </span>
                            <span className='font-bold text-nike-black'>
                                ¥{afterSale.actualAmount || 0}
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* 售后商品 */}
            <section>
                <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                    售后商品
                </h4>
                <div className='divide-y divide-nike-grey border border-nike-grey rounded-lg overflow-hidden'>
                    {afterSale.items?.map((item: any) => (
                        <div
                            key={item.id}
                            className='flex gap-4 p-4 items-center'
                        >
                            <img
                                src={item.orderItem?.productImg}
                                alt={item.orderItem?.productName}
                                className='w-20 h-20 object-cover rounded bg-nike-grey'
                            />
                            <div className='flex-1'>
                                <h5 className='font-bold'>
                                    {item.orderItem?.productName}
                                </h5>
                                <p className='text-sm text-nike-dark-grey'>
                                    数量: {item.quantity}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 补充说明 */}
            {afterSale.description && (
                <section>
                    <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                        问题描述
                    </h4>
                    <div className='p-4 bg-nike-grey/20 rounded-lg text-sm italic'>
                        "{afterSale.description}"
                    </div>
                </section>
            )}

            {/* 凭证图片 */}
            {afterSale.images && afterSale.images.length > 0 && (
                <section>
                    <h4 className='pb-2 mb-4 text-lg font-bold border-b border-nike-grey'>
                        凭证图片
                    </h4>
                    <div className='flex gap-4'>
                        {afterSale.images.map((url: string, i: number) => (
                            <a
                                key={i}
                                href={url}
                                target='_blank'
                                rel='noreferrer'
                            >
                                <img
                                    src={url}
                                    className='w-32 h-32 object-cover rounded border border-nike-grey hover:border-nike-black transition-colors'
                                    alt='凭证'
                                />
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
