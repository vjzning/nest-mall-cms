import { authActions } from './auth';
import { cartActions } from './cart';

export const server = {
  auth: authActions,
  cart: cartActions,
};