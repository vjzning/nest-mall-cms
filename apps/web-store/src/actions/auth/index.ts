import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS } from '../../lib/api';

export const authActions = {
  // 登录 action
  login: defineAction({
    accept: 'form',
    input: z.object({
      username: z.string().min(1, '用户名不能为空'),
      password: z.string().min(1, '密码不能为空'),
    }),
    handler: async (input, context) => {
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '登录失败');
        }

        // 使用 Astro.session 存储
        if (context.session) {
          await context.session.set('user', data.user);
          await context.session.set('token', data.token);
        }

        return { success: true, user: data.user };
      } catch (error: any) {
        throw new Error(error.message || '登录失败，请重试');
      }
    },
  }),

  // 注册 action
  register: defineAction({
    accept: 'form',
    input: z.object({
      username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
      password: z.string().min(6, '密码至少6个字符'),
      email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
      phone: z.string().regex(/^[0-9]{11}$/, '手机号格式不正确').optional().or(z.literal('')),
    }),
    handler: async (input, context) => {
      try {
        const response = await fetch(API_ENDPOINTS.REGISTER, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...input,
            nickname: input.username,
            email: input.email || undefined,
            phone: input.phone || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '注册失败');
        }

        // 使用 Astro.session 存储
        if (context.session) {
          await context.session.set('user', data.user);
          await context.session.set('token', data.token);
        }

        return { success: true, user: data.user };
      } catch (error: any) {
        throw new Error(error.message || '注册失败，请重试');
      }
    },
  }),

  // 登出 action
  logout: defineAction({
    accept: 'form',
    handler: async (input, context) => {
      if (context.session) {
        await context.session.destroy();
      }
      return { success: true };
    },
  }),

  // 更新个人信息 action
  updateProfile: defineAction({
    accept: 'form',
    input: z.object({
      nickname: z.string().optional(),
      email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
      phone: z.string().regex(/^[0-9]{11}$/, '手机号格式不正确').optional().or(z.literal('')),
      avatar: z.string().url('头像URL格式不正确').optional().or(z.literal('')),
    }),
    handler: async (input, context) => {
      if (!context.session) {
        throw new Error('请先登录');
      }

      try {
        const token = await context.session.get('token');
        
        if (!token) {
          throw new Error('请先登录');
        }
        
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nickname: input.nickname,
            email: input.email || undefined,
            phone: input.phone || undefined,
            avatar: input.avatar || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '更新失败');
        }

        // 更新 session
        await context.session.set('user', data);

        return { success: true, user: data };
      } catch (error: any) {
        throw new Error(error.message || '更新失败，请重试');
      }
    },
  }),
};