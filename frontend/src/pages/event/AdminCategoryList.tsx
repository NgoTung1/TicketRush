import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi, CategoryResponse } from '@/api/categoryApi';
import SearchBar from '@/components/ui/SearchBar';

const PAGE_SIZE = 12;

const AdminCategoryList: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await categoryApi.getAllCategories();
      let list: CategoryResponse[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (res?.content && Array.isArray(res.content)) list = res.content;
      else if (res?.result && Array.isArray(res.result)) list = res.result;
      setCategories(list);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lọc
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE) || 1;
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#141414] px-4 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="w-[320px]">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Tìm kiếm"
              className="bg-[#2A2A2A] rounded-xl"
            />
          </div>
          <button
            onClick={() => navigate('/admin/categories/create')}
            className="px-6 py-1 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-[12px] font-bold rounded-full transition-colors"
          >
            Tạo danh mục
          </button>
        </div>

        {error && (
          <div className="text-red-400 bg-red-400/10 p-4 rounded-xl mb-6">{error}</div>
        )}

        {loading ? (
          <div className="text-white text-center py-20">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/admin/categories/${category.id}`)}
                  className="bg-[#1C1C1C] hover:bg-[#2A2A2A] cursor-pointer rounded-xl p-5 flex justify-between items-center transition-colors border border-white/5"
                >
                  <span className="text-white font-bold text-[14px]">{category.name}</span>
                  {!category.isDeleted ? (
                    <span className="px-3 py-1 rounded-full border border-[#3CFF4D] bg-[#375C3A] text-[#3CFF4D] text-[10px] font-bold whitespace-nowrap">
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full border border-[#FF3C3C] bg-[#5C3737] text-[#FF3C3C] text-[10px] font-bold whitespace-nowrap">
                      Ngừng hoạt động
                    </span>
                  )}
                </div>
              ))}
              {currentCategories.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">
                  Không tìm thấy danh mục nào
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded disabled:opacity-50 font-bold"
                >
                  {'<'}
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${currentPage === idx + 1
                        ? 'bg-white/20 text-white'
                        : 'text-white hover:bg-white/10'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded disabled:opacity-50 font-bold"
                >
                  {'>'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryList;
