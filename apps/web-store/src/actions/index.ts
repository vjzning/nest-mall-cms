import { authActions } from './auth';
import { cartActions } from './cart';
import { addressActions } from './address';

export const server = {
  auth: authActions,
  cart: cartActions,
  address: addressActions,
};