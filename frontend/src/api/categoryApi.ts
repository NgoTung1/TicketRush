import axiosClient from '@/lib/axios';

const CATEGORY_BASE = '/api/categories';

// ─── Types (mirror CategoryDTO.java) ──────────────────────────────────────────

export interface CategoryResponse {
  id: string;       // UUID → string
  name: string;
  isDeleted: boolean;
}

export interface CategoryRequest {
  name: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const categoryApi = {
  /**
   * [PUBLIC] Lấy danh sách danh mục đang hoạt động (isDeleted = false)
   * GET /api/categories
   */
  getActiveCategories: () =>
    axiosClient.get<CategoryResponse[]>(CATEGORY_BASE),

  /**
   * [PUBLIC] Lấy chi tiết một danh mục theo ID
   * GET /api/categories/{id}
   */
  getCategoryById: (id: string) =>
    axiosClient.get<CategoryResponse>(`${CATEGORY_BASE}/${id}`),

  /**
   * [ADMIN] Lấy tất cả danh mục (kể cả đã xóa mềm)
   * GET /api/categories/admin/all
   */
  getAllCategories: () =>
    axiosClient.get<CategoryResponse[]>(`${CATEGORY_BASE}/admin/all`),

  /**
   * [ADMIN] Tạo danh mục mới
   * POST /api/categories
   */
  createCategory: (data: CategoryRequest) =>
    axiosClient.post<CategoryResponse>(CATEGORY_BASE, data),

  /**
   * [ADMIN] Cập nhật danh mục
   * PUT /api/categories/{id}
   */
  updateCategory: (id: string, data: CategoryRequest) =>
    axiosClient.put<CategoryResponse>(`${CATEGORY_BASE}/${id}`, data),

  /**
   * [ADMIN] Xóa mềm danh mục
   * DELETE /api/categories/{id}
   */
  deleteCategory: (id: string) =>
    axiosClient.delete<string>(`${CATEGORY_BASE}/${id}`),

  /**
   * [ADMIN] Khôi phục danh mục
   * PUT /api/categories/{id}/restore
   */
  restoreCategory: (id: string) =>
    axiosClient.put<CategoryResponse>(`${CATEGORY_BASE}/${id}/restore`),
};
