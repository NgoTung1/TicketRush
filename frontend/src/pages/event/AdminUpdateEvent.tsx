import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventSessionForm, { SessionFormData } from '../../components/event/EventSessionForm';
import EventInput from '../../components/event/EventInput';
import { eventApi, EventUpdateRequest } from '../../api/eventApi';
import { eventSessionApi, EventSessionCreateRequest, EventSessionUpdateRequest } from '../../api/eventSessionApi';
import { categoryApi, CategoryResponse } from '../../api/categoryApi';
import Loading from '@/components/ui/Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  organizer: string;
  title: string;
  description: string;
  address: string;
  startTime: string;      // datetime-local string
  categoryId: string;
  status: string;
}

const AdminUpdateEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState<FormState>({
    organizer: '',
    title: '',
    description: '',
    address: '',
    startTime: '',
    categoryId: '',
    status: 'ONCOMING',
  });

  // Sessions: Mỗi session có thể có id từ backend (string) hoặc id tạm thời (number)
  const [sessions, setSessions] = useState<{ id: string | number; data: SessionFormData }[]>([]);
  const [sessionCounter, setSessionCounter] = useState(0);

  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // Page state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ─── Initial Load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Load Categories
        const catRes: any = await categoryApi.getAllCategories();
        const catList = Array.isArray(catRes) ? catRes : catRes?.data ?? [];
        setCategories(catList);

        // 2. Load Event
        const eventRes: any = await eventApi.getEventById(id);
        const e = eventRes?.data ?? eventRes;

        // Nếu status không phải ONCOMING -> Chặn truy cập và redirect về trang danh sách
        if (e.status !== 'ONCOMING') {
          navigate('/admin/event-list', { replace: true });
          return;
        }

        setForm({
          organizer: e.organizer || '',
          title: e.title || '',
          description: e.description || '',
          address: e.address || '',
          startTime: e.startTime ? new Date(e.startTime).toISOString().slice(0, 16) : '',
          categoryId: e.categoryId || '',
          status: e.status || 'ONCOMING',
        });
        setBannerPreview(e.bannerUrl);

        // 3. Load Sessions
        const sessRes: any = await eventSessionApi.getSessionsByEventId(id);
        const sessList = Array.isArray(sessRes) ? sessRes : sessRes?.data ?? [];
        setSessions(
          sessList.map((s: any) => ({
            id: s.id,
            data: {
              name: s.name,
              startAt: s.startAt ? new Date(s.startAt).toISOString().slice(0, 16) : '',
              endAt: s.endAt ? new Date(s.endAt).toISOString().slice(0, 16) : '',
            },
          }))
        );
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin sự kiện.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleFormChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSessionChange = (id: string | number, data: SessionFormData) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, data } : s)));
  };

  const handleAddSession = () => {
    const nextId = sessionCounter + 1;
    setSessionCounter(nextId);
    setSessions((prev) => [
      ...prev,
      { id: `new-${nextId}`, data: { name: '', startAt: '', endAt: '' } }
    ]);
  };

  const handleRemoveSession = (id: string | number) =>
    setSessions((prev) => prev.filter((s) => s.id !== id));

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!id) return;
    setError(null);

    if (!form.title.trim()) return setError('Vui lòng nhập tên sự kiện.');
    if (!form.categoryId) return setError('Vui lòng chọn thể loại sự kiện.');

    setSubmitting(true);
    try {
      const eventData: EventUpdateRequest = {
        title: form.title.trim(),
        categoryId: form.categoryId,
        organizer: form.organizer.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        status: form.status as any,
      };

      // 1. Update Event Info
      await eventApi.updateEvent(id, eventData, bannerFile ?? undefined);

      // 2. Update Sessions
      // Với logic đơn giản:
      // - Nếu session.id bắt đầu bằng 'new-' -> Tạo mới
      // - Ngược lại -> Update
      // (Lưu ý: Logic delete chưa được handle ở đây để giữ giao diện giống Create như yêu cầu)
      await Promise.all(
        sessions.map((s) => {
          const sessionReq: EventSessionCreateRequest = {
            name: s.data.name.trim(),
            startAt: new Date(s.data.startAt).toISOString(),
            endAt: s.data.endAt ? new Date(s.data.endAt).toISOString() : new Date(s.data.startAt).toISOString(),
          };

          if (typeof s.id === 'string' && s.id.startsWith('new-')) {
            return eventSessionApi.createSession(id, sessionReq);
          } else {
            return eventSessionApi.updateSession(s.id.toString(), sessionReq as EventSessionUpdateRequest);
          }
        })
      );

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Cập nhật sự kiện thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (loading) return <Loading visible />;

  if (success) {
    return (
      <div className="bg-[#141414] min-h-screen text-white font-roboto flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#00a3ff]/20 flex items-center justify-center mx-auto text-3xl">✨</div>
          <h2 className="text-2xl font-bold">Cập nhật thành công!</h2>
          <p className="text-white/50 text-sm">Mọi thay đổi đã được lưu lại.</p>
          <div className="flex flex-col gap-2 pt-4">
            <button
              onClick={() => navigate(`/admin/event/${id}`)}
              className="px-8 py-2.5 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-sm font-bold rounded-full transition-colors"
            >
              Xem chi tiết sự kiện
            </button>
            <button
              onClick={() => navigate('/admin/event-list')}
              className="px-8 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full transition-colors"
            >
              Về danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white font-roboto pb-12 pt-6">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-[32px] font-bold text-white">Cập nhật sự kiện</h2>
        </div>

        <div className="space-y-1">
          <EventInput
            label="Ban tổ chức"
            value={form.organizer}
            onChange={handleFormChange('organizer')}
            placeholder="Nhập tên ban tổ chức"
          />
          <EventInput
            label="Tên sự kiện"
            value={form.title}
            onChange={handleFormChange('title')}
            placeholder="Nhập tên sự kiện"
          />
          <EventInput
            label="Mô tả"
            type="textarea"
            value={form.description}
            onChange={handleFormChange('description')}
            placeholder="Nhập mô tả sự kiện"
          />
          <EventInput
            label="Địa chỉ"
            value={form.address}
            onChange={handleFormChange('address')}
            placeholder="Nhập địa điểm diễn ra sự kiện"
          />
          <EventInput
            label="Thời gian diễn ra"
            type="datetime-local"
            value={form.startTime}
            onChange={handleFormChange('startTime')}
          />
          <EventInput
            label="Thể loại sự kiện"
            type="select"
            value={form.categoryId}
            onChange={handleFormChange('categoryId')}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          {/* Banner */}
          <div className="mb-8 pt-2">
            <label className="text-white font-bold text-[20px] block mb-3">Ảnh banner</label>
            <input
              ref={bannerInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleBannerChange}
            />
            {bannerPreview ? (
              <div
                className="relative w-full max-w-[600px] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
              >
                <img src={bannerPreview} alt="Banner" className="w-full h-auto block" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-bold bg-black/60 px-4 py-2 rounded-full">Thay đổi banner</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#8D8D8D] text-white text-[13px] font-bold rounded-xl"
              >
                Thêm ảnh mới
              </button>
            )}
          </div>

          {/* Sessions */}
          <div className="pt-6 border-t border-white/5 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-[20px]">Lịch trình sự kiện</h3>
              <button
                type="button"
                onClick={handleAddSession}
                className="px-4 py-1.5 bg-[#8D8D8D] text-white text-[13px] font-bold rounded-xl"
              >
                Thêm phiên
              </button>
            </div>
            <div className="space-y-4">
              {sessions.map((s, idx) => (
                <EventSessionForm
                  key={s.id}
                  index={idx + 1}
                  data={s.data}
                  onChange={(data) => handleSessionChange(s.id, data)}
                  onRemove={() => handleRemoveSession(s.id)}
                  canRemove={sessions.length > 1}
                />
              ))}
            </div>
          </div>

          {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}

          <div className="mt-10 flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[14px] font-bold rounded-full transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-[14px] font-bold rounded-full shadow-lg shadow-[#00a3ff]/20"
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateEvent;
