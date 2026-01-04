import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { API_ENDPOINTS, getApiUrl, request } from "../lib/api";

const getHeaders = async (context: any) => {
  const token = await context.session?.get("token");
  return {
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
        const address = await request(`${apiUrl}/member/address`, {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        });
        return { success: true, address };
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
        const address = await request(`${apiUrl}/member/address/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(rest),
        });
        return { success: true, address };
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
        await request(`${apiUrl}/member/address/${input.id}`, {
          method: "DELETE",
          headers,
        });
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
        await request(
          `${apiUrl}/member/address/${input.id}/default`,
          {
            method: "PATCH",
            headers,
          }
        );
        return { success: true };
      } catch (error: any) {
        console.error("Set default address error:", error);
        throw error;
      }
    },
  }),
};
