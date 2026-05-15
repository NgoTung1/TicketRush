import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '@/api/categoryApi';

const AdminCreateCategory: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      await categoryApi.createCategory({ name: name.trim() });
      navigate('/admin/categories');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tạo danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#141414] px-4 py-8">
      <div className="max-w-[1200px] mx-auto bg-[#1C1C1C] rounded-2xl min-h-[600px] flex flex-col relative overflow-hidden shadow-xl border border-white/5">
        <div className="p-8 flex-1">
          <h1 className="text-white font-bold text-[24px] mb-8">Danh mục sự kiện</h1>
          
          <div className="mb-6 max-w-full">
            <label className="block text-white font-bold text-[16px] mb-2">Tên danh mục</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục"
              className="w-full bg-[#383838] text-white placeholder-[#868686] text-[16px] font-medium rounded-xl px-4 py-3 outline-none border border-transparent focus:border-white/20 transition-colors"
            />
          </div>

          {error && (
            <div className="text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-4 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 flex justify-end gap-3 mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="px-6 py-2.5 bg-[#00a3ff] hover:bg-[#0090FF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-full transition-colors"
          >
            {submitting ? 'Đang tạo...' : 'Tạo danh mục'}
          </button>
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

export default AdminCreateCategory;
