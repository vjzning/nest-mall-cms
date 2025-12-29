import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { API_ENDPOINTS, getApiUrl } from "../lib/api";

const getHeaders = async (context: any) => {
  const token = await context.session?.get("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const addressActions = {
  createAddress: defineAction({
    accept: "form",
    input: z.object({
      receiverName: z.string().min(1, "收货人姓名不能为空"),
      receiverPhone: z.string().min(1, "收货人电话不能为空"),
      countryCode: z.string().min(2, "国家代码不能为空"),
      countryName: z.string().optional(),
      stateProvince: z.string().optional(),
      city: z.string().optional(),
      districtCounty: z.string().optional(),
      addressLine1: z.string().min(1, "详细地址不能为空"),
      addressLine2: z.string().optional(),
      postalCode: z.string().optional(),
      isDefault: z
        .any()
        .optional()
        .transform((v) => (v === "on" || v === "1" || v === 1 ? 1 : 0)),
      tag: z.string().optional(),
    }),
    handler: async (input, context) => {
      try {
        const headers = await getHeaders(context);
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/member/address`, {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "保存地址失败");
        return { success: true, address: data };
      } catch (error: any) {
        console.error("Create address error:", error);
        throw error;
      }
    },
  }),

  updateAddress: defineAction({
    accept: "form",
    input: z.object({
      id: z.string(),
      receiverName: z.string().min(1, "收货人姓名不能为空"),
      receiverPhone: z.string().min(1, "收货人电话不能为空"),
      countryCode: z.string().min(2, "国家代码不能为空"),
      countryName: z.string().optional(),
      stateProvince: z.string().optional(),
      city: z.string().optional(),
      districtCounty: z.string().optional(),
      addressLine1: z.string().min(1, "详细地址不能为空"),
      addressLine2: z.string().optional(),
      postalCode: z.string().optional(),
      isDefault: z
        .any()
        .optional()
        .transform((v) => (v === "on" || v === "1" || v === 1 ? 1 : 0)),
      tag: z.string().optional(),
    }),
    handler: async (input, context) => {
      try {
        const { id, ...rest } = input;
        const headers = await getHeaders(context);
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/member/address/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(rest),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "更新地址失败");
        return { success: true, address: data };
      } catch (error: any) {
        console.error("Update address error:", error);
        throw error;
      }
    },
  }),

  deleteAddress: defineAction({
    accept: "form",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      try {
        const headers = await getHeaders(context);
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/member/address/${input.id}`, {
          method: "DELETE",
          headers,
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "删除地址失败");
        }
        return { success: true };
      } catch (error: any) {
        console.error("Delete address error:", error);
        throw error;
      }
    },
  }),

  setDefaultAddress: defineAction({
    accept: "form",
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      try {
        const headers = await getHeaders(context);
        const apiUrl = getApiUrl();
        const response = await fetch(
          `${apiUrl}/member/address/${input.id}/default`,
          {
            method: "PATCH",
            headers,
          }
        );
        if (!response.ok) {
          const text = await response.text();
          let message = "设置默认地址失败";
          try {
            const data = JSON.parse(text);
            message = data.message || message;
          } catch (e) {}
          throw new Error(message);
        }
        return { success: true };
      } catch (error: any) {
        console.error("Set default address error:", error);
        throw error;
      }
    },
  }),
};
