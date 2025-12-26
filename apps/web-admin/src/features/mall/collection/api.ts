import { api } from '@/lib/axios';

export async function getCollections(params: { page?: number; limit?: number }) {
  const { data } = await api.get('/mall/collections', { params });
  return data;
}

export async function getCollection(id: string | number) {
  const { data } = await api.get(`/mall/collections/${id}`);
  return data;
}

export async function createCollection(data: any) {
  return api.post('/mall/collections', data);
}

export async function updateCollection(id: string | number, data: any) {
  return api.put(`/mall/collections/${id}`, data);
}

export async function deleteCollection(id: string | number) {
  return api.delete(`/mall/collections/${id}`);
}

export async function addCollectionItems(id: string | number, items: any[]) {
  return api.post(`/mall/collections/${id}/items`, items);
}
