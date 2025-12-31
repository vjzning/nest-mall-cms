import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  couponApi,
  CouponType,
  CouponCategory,
  CouponScopeType,
  CouponValidityType,
  CouponStatus,
  type CreateCouponDto,
} from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Save, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CouponFormPage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id?: string };
  const isEdit = !!id;
  const queryClient = useQueryClient();

  const form = useForm<CreateCouponDto>({
    defaultValues: {
      name: '',
      type: CouponType.CASH,
      category: CouponCategory.PLATFORM,
      value: 0,
      minAmount: 0,
      scopeType: CouponScopeType.ALL,
      isStackable: false,
      totalQuantity: -1,
      userLimit: 1,
      validityType: CouponValidityType.FIXED_RANGE,
      status: CouponStatus.OFF_SHELF,
      scopeTargetIds: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = form;

  const type = watch('type');
  const validityType = watch('validityType');
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const isStackable = watch('isStackable');
  const status = watch('status');

  // Fetch data if edit
  const { data: coupon, isLoading } = useQuery({
    queryKey: ['coupon', id],
    queryFn: () => couponApi.getCoupon(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (coupon?.data) {
      reset(coupon.data);
    }
  }, [coupon, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateCouponDto) =>
      isEdit ? couponApi.updateCoupon(Number(id), data) : couponApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(isEdit ? '优惠券已更新' : '优惠券已创建');
      navigate({ to: '/mall/coupon' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '操作失败');
    },
  });

  const onSubmit = (data: CreateCouponDto) => {
    // 转换数字类型
    const payload = {
      ...data,
      value: Number(data.value),
      minAmount: Number(data.minAmount),
      totalQuantity: Number(data.totalQuantity),
      userLimit: Number(data.userLimit),
      validDays: data.validDays ? Number(data.validDays) : undefined,
    };
    mutation.mutate(payload);
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate({ to: '/mall/coupon' })}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? '编辑优惠券' : '创建优惠券'}
          </h2>
          <p className="text-muted-foreground">
            设置优惠券的基础信息、领取规则和使用限制
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>优惠券的核心展示信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">优惠券名称</Label>
                <Input
                  id="name"
                  placeholder="例如：双十一满减券、新用户专享"
                  {...register('name', { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>优惠类型</Label>
                  <Select
                    value={type.toString()}
                    onValueChange={(val) => setValue('type', Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CouponType.CASH.toString()}>满减券</SelectItem>
                      <SelectItem value={CouponType.DISCOUNT.toString()}>折扣券</SelectItem>
                      <SelectItem value={CouponType.FREE_POST.toString()}>免邮券</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{type === CouponType.DISCOUNT ? '折扣比例 (0-1)' : '面值 (元)'}</Label>
                  <Input
                    type="number"
                    step={type === CouponType.DISCOUNT ? '0.01' : '1'}
                    {...register('value', { required: true })}
                  />
                  {type === CouponType.DISCOUNT && (
                    <p className="text-xs text-muted-foreground">0.85 表示 85 折</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>使用门槛 (满 X 元可用)</Label>
                  <Input
                    type="number"
                    {...register('minAmount')}
                  />
                  <p className="text-xs text-muted-foreground">0 表示无门槛</p>
                </div>
                <div className="space-y-2">
                  <Label>适用范围</Label>
                  <Select
                    value={watch('scopeType')?.toString()}
                    onValueChange={(val) => setValue('scopeType', Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CouponScopeType.ALL.toString()}>全场通用</SelectItem>
                      <SelectItem value={CouponScopeType.CATEGORY.toString()}>指定分类</SelectItem>
                      <SelectItem value={CouponScopeType.PRODUCT.toString()}>指定商品</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>有效期设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>有效期类型</Label>
                <Select
                  value={validityType.toString()}
                  onValueChange={(val) => setValue('validityType', Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CouponValidityType.FIXED_RANGE.toString()}>固定时间段</SelectItem>
                    <SelectItem value={CouponValidityType.DAYS_AFTER_CLAIM.toString()}>领取后 N 天内有效</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {validityType === CouponValidityType.FIXED_RANGE ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label>开始时间</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !startTime && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startTime ? format(new Date(startTime), "yyyy-MM-dd") : "选择日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startTime ? new Date(startTime) : undefined}
                          onSelect={(date) => setValue('startTime', date?.toISOString())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>结束时间</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !endTime && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endTime ? format(new Date(endTime), "yyyy-MM-dd") : "选择日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endTime ? new Date(endTime) : undefined}
                          onSelect={(date) => setValue('endTime', date?.toISOString())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>有效天数</Label>
                  <Input
                    type="number"
                    placeholder="请输入天数"
                    {...register('validDays')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>领取规则</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>发放总量</Label>
                <Input
                  type="number"
                  {...register('totalQuantity')}
                />
                <p className="text-xs text-muted-foreground">-1 表示不限量</p>
              </div>
              <div className="space-y-2">
                <Label>每人限领张数</Label>
                <Input
                  type="number"
                  {...register('userLimit')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>允许与其他优惠叠加</Label>
                  <p className="text-xs text-muted-foreground">开启后可与店铺券叠加使用</p>
                </div>
                <Switch
                  checked={isStackable}
                  onCheckedChange={(val) => setValue('isStackable', val)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>发布状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>立即激活</Label>
                  <p className="text-xs text-muted-foreground">激活后用户即可领取使用</p>
                </div>
                <Switch
                  checked={status === CouponStatus.ACTIVE}
                  onCheckedChange={(val) => setValue('status', val ? CouponStatus.ACTIVE : CouponStatus.OFF_SHELF)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isEdit ? '保存修改' : '立即创建'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
