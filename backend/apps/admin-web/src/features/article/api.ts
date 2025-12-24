import { api } from '@/lib/axios';

export interface Article {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content: string;
  cover?: string;
  status: number; // 0: Draft, 1: Published
  isRecommend: boolean;
  isTop: boolean;
  views: number;
  likes: number;
  authorId?: number;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  tags?: { id: number; name: string }[];
  author?: { id: number; username: string; nickname?: string };
}

export interface CreateArticleDto {
  title: string;
  slug: string;
  description?: string;
  content: string;
  cover?: string;
  status: number;
  isRecommend?: number;
  isTop?: number;
  categoryId?: number;
  tagIds?: number[];
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface ArticleQueryParams {
    page?: number;
    limit?: number;
    title?: string;
    categoryId?: number;
    status?: number;
}

export interface ArticleListResponse {
    items: Article[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const articleApi = {
  findAll: async (params?: ArticleQueryParams) => {
    const { data } = await api.get<ArticleListResponse>('/article', { params });
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<Article>(`/article/${id}`);
    return data;
  },
  create: async (data: CreateArticleDto) => {
    const { data: res } = await api.post<Article>('/article', data);
    return res;
  },
  update: async (id: number, data: UpdateArticleDto) => {
    const { data: res } = await api.put<Article>(`/article/${id}`, data);
    return res;
  },
  audit: async (id: number, status: number) => {
    const { data: res } = await api.patch<Article>(`/article/${id}/audit`, { status });
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/article/${id}`);
  },
};
