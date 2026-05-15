import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryApi, CategoryResponse } from '@/api/categoryApi';

const AdminCategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res: any = await categoryApi.getCategoryById(id);
        const data = res?.data || res;
        setCategory(data);
      } catch (err: any) {
        console.error(err);
        setError('Không thể tải chi tiết danh mục.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!category || !id) return;
    try {
      setSubmitting(true);
      if (category.isDeleted) {
        await categoryApi.restoreCategory(id);
      } else {
        await categoryApi.deleteCategory(id);
      }
      navigate('/admin/categories');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] text-white p-10 text-center font-bold">Đang tải...</div>;
  if (!category) return <div className="min-h-screen bg-[#141414] text-white p-10 text-center font-bold">Không tìm thấy danh mục.</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#141414] px-4 py-8">
      <div className="max-w-[1200px] mx-auto bg-[#1C1C1C] rounded-2xl min-h-[600px] flex flex-col relative overflow-hidden shadow-xl border border-white/5">
        <div className="p-8 flex-1">
          <h1 className="text-white font-bold text-[24px] mb-8">Danh mục sự kiện</h1>
          
          <div className="mb-6 max-w-full">
            <label className="block text-white font-bold text-[16px] mb-2">Tên danh mục</label>
            <input
              type="text"
              value={category.name}
              disabled
              className="w-full bg-[#383838] text-[#868686] text-[16px] font-medium rounded-xl px-4 py-3 outline-none cursor-not-allowed border border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-bold text-[16px] mb-2">Trạng thái</label>
            <div>
              {!category.isDeleted ? (
                <span className="inline-block px-3 py-1 rounded-full border border-[#00FF47] text-[#00FF47] text-[10px] font-bold whitespace-nowrap bg-[#00FF47]/5">
                  Đang hoạt động
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full border border-[#FF3B30] text-[#FF3B30] text-[10px] font-bold whitespace-nowrap bg-[#FF3B30]/5">
                  Ngừng hoạt động
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-4 rounded-xl mt-6 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 flex justify-end gap-3 mt-auto">
          {!category.isDeleted ? (
            <button
              onClick={handleToggleStatus}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#FF3B30] hover:bg-[#FF3B30]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-full transition-colors"
            >
              {submitting ? 'Đang xử lý...' : 'Xóa danh mục'}
            </button>
          ) : (
            <button
              onClick={handleToggleStatus}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#00a3ff] hover:bg-[#0090FF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-full transition-colors"
            >
              {submitting ? 'Đang xử lý...' : 'Khôi phục'}
            </button>
          )}

          <button
            onClick={() => navigate('/admin/categories')}
            className="px-6 py-2.5 bg-[#5A5A5A] hover:bg-[#666] text-white font-bold text-[14px] rounded-full transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryDetail;
