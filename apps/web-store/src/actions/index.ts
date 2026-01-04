import { authActions } from './auth';
import { cartActions } from './cart';
import { addressActions } from './address';
import { orderActions } from './order';
import { afterSaleActions } from './after-sale';
import { favorite as favoriteActions } from './favorite';
import { couponActions } from './coupon';
import { flashSaleActions } from './flash-sale';

export const server = {
    auth: authActions,
    cart: cartActions,
    address: addressActions,
    order: orderActions,
    afterSale: afterSaleActions,
    favorite: favoriteActions,
    coupon: couponActions,
    flashSale: flashSaleActions,
};
