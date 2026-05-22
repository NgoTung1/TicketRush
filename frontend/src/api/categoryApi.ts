import axiosClient from '@/lib/axios';

const CATEGORY_BASE = '/api/categories';


export interface CategoryResponse {
  id: string;
  name: string;
  isDeleted: boolean;
}

export interface CategoryRequest {
  name: string;
}


export const categoryApi = {

  getActiveCategories: () =>
    axiosClient.get<CategoryResponse[]>(CATEGORY_BASE),

  getCategoryById: (id: string) =>
    axiosClient.get<CategoryResponse>(`${CATEGORY_BASE}/${id}`),

  getAllCategories: () =>
    axiosClient.get<CategoryResponse[]>(`${CATEGORY_BASE}/admin/all`),

  createCategory: (data: CategoryRequest) =>
    axiosClient.post<CategoryResponse>(CATEGORY_BASE, data),

  updateCategory: (id: string, data: CategoryRequest) =>
    axiosClient.put<CategoryResponse>(`${CATEGORY_BASE}/${id}`, data),

  deleteCategory: (id: string) =>
    axiosClient.delete<string>(`${CATEGORY_BASE}/${id}`),

  restoreCategory: (id: string) =>
    axiosClient.put<CategoryResponse>(`${CATEGORY_BASE}/${id}/restore`),
};
