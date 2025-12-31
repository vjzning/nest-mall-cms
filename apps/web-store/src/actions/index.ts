import { authActions } from './auth';
import { cartActions } from './cart';
import { addressActions } from './address';
import { orderActions } from './order';
import { afterSaleActions } from './after-sale';
import { favorite as favoriteActions } from './favorite';

export const server = {
    auth: authActions,
    cart: cartActions,
    address: addressActions,
    order: orderActions,
    afterSale: afterSaleActions,
    favorite: favoriteActions,
};
