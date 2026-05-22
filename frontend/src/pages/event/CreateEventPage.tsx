import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm import này
import EventSessionForm, { SessionFormData } from '../../components/event/EventSessionForm';
import EventInput from '../../components/event/EventInput';
import { eventApi, EventCreateRequest } from '../../api/eventApi';
import { eventSessionApi, EventSessionCreateRequest } from '../../api/eventSessionApi';
import { categoryApi, CategoryResponse } from '../../api/categoryApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  organizer: string;
  title: string;
  description: string;
  address: string;
  startTime: string;      // datetime-local string
  categoryId: string;
}

let sessionCounter = 3;

const makeSession = (): { id: number; data: SessionFormData } => ({
  id: ++sessionCounter,
  data: { name: '', startAt: '', endAt: '' },
});

// ─── Component ────────────────────────────────────────────────────────────────

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate(); // Khởi tạo hook điều hướng

  // Form state
  const [form, setForm] = useState<FormState>({
    organizer: '',
    title: '',
    description: '',
    address: '',
    startTime: '',
    categoryId: '',
  });

  // Sessions
  const [sessions, setSessions] = useState<{ id: number; data: SessionFormData }[]>([
    { id: 1, data: { name: '', startAt: '', endAt: '' } },
    { id: 2, data: { name: '', startAt: '', endAt: '' } },
    { id: 3, data: { name: '', startAt: '', endAt: '' } },
  ]);

  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    categoryApi.getAllCategories().then((res: any) => {
      let list: CategoryResponse[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (res?.content && Array.isArray(res.content)) list = res.content;
      else if (res?.result && Array.isArray(res.result)) list = res.result;

      setCategories(list);
    }).catch(console.error);
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleFormChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === 'startTime' && sessions.length > 0) {
      setSessions((prev) => {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          data: {
            ...updated[0].data,
            startAt: value,
          },
        };
        return updated;
      });
    }
  };

  const handleSessionChange = (id: number, data: SessionFormData) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, data } : s)));
  };

  const handleAddSession = () => setSessions((prev) => [...prev, makeSession()]);

  const handleRemoveSession = (id: number) =>
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
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError(null);

    // Validate
    if (!form.title.trim()) return setError('Vui lòng nhập tên sự kiện.');
    if (!form.categoryId) return setError('Vui lòng chọn thể loại sự kiện.');
    if (!form.startTime) return setError('Vui lòng chọn thời gian diễn ra.');

    const eventStartTime = new Date(form.startTime);
    const now = new Date();
    const minEventStartTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    if (eventStartTime < minEventStartTime) {
      return setError('Thời gian bắt đầu sự kiện phải ít nhất 7 ngày sau thời điểm hiện tại!');
    }

    const validSessions = sessions.filter((s) => s.data.name.trim() && s.data.startAt);
    if (validSessions.length === 0) {
      return setError('Vui lòng thêm ít nhất một phiên sự kiện hợp lệ.');
    }

    const eventYear = eventStartTime.getFullYear();
    const eventMonth = eventStartTime.getMonth();
    const eventDay = eventStartTime.getDate();
    const eventDateOnly = new Date(eventYear, eventMonth, eventDay);

    let hasSameDaySession = false;

    for (const session of validSessions) {
      const sessionStartAt = new Date(session.data.startAt);

      // Kiểm tra 7 ngày đối với phiên sự kiện
      if (sessionStartAt < minEventStartTime) {
        return setError(`Thời gian bắt đầu phiên sự kiện "${session.data.name}" phải cách hiện tại ít nhất 7 ngày.`);
      }

      const sessionYear = sessionStartAt.getFullYear();
      const sessionMonth = sessionStartAt.getMonth();
      const sessionDay = sessionStartAt.getDate();
      const sessionDateOnly = new Date(sessionYear, sessionMonth, sessionDay);

      // Kiểm tra xem phiên sự kiện có trước ngày diễn ra sự kiện không
      if (sessionDateOnly < eventDateOnly) {
        return setError(`Phiên sự kiện "${session.data.name}" không được diễn ra trước ngày bắt đầu sự kiện.`);
      }

      // Kiểm tra xem phiên có cùng ngày với ngày bắt đầu sự kiện không
      if (sessionYear === eventYear && sessionMonth === eventMonth && sessionDay === eventDay) {
        hasSameDaySession = true;
      }
    }

    if (!hasSameDaySession) {
      return setError('Phải có ít nhất 1 phiên sự kiện diễn ra cùng ngày với ngày bắt đầu sự kiện.');
    }

    setSubmitting(true);
    try {
      const eventData: EventCreateRequest = {
        title: form.title.trim(),
        categoryId: form.categoryId,
        organizer: form.organizer.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        startTime: new Date(form.startTime).toISOString(),
      };

      // 1. Tạo event (gửi kèm banner file nếu có)
      const createdEvent: any = await eventApi.createEvent(
        eventData,
        bannerFile ?? undefined
      );

      // Lấy eventId từ response
      const eventId: string = createdEvent?.id ?? createdEvent?.data?.id;

      // 2. Tạo các sessions
      await Promise.all(
        validSessions.map((s) => {
          const sessionReq: EventSessionCreateRequest = {
            name: s.data.name.trim(),
            startAt: new Date(s.data.startAt).toISOString(),
            endAt: s.data.endAt ? new Date(s.data.endAt).toISOString() : new Date(s.data.startAt).toISOString(),
          };
          return eventSessionApi.createSession(eventId, sessionReq);
        })
      );

      // 3. CHUYỂN HƯỚNG TỚI TRANG TẠO MA TRẬN GHẾ (KÈM ID SỰ KIỆN VỪA TẠO)
      navigate(`/admin/event/room/${eventId}`);

    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Tạo sự kiện thất bại. Vui lòng thử lại.';
      setError(msg);
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#141414] min-h-screen text-white font-roboto pb-4">
      {/* Main */}
      <div className="mx-auto px-10 pt-4">
        <h2 className="text-[32px] font-bold text-white mb-2">Thông tin sự kiện</h2>

        <div className="space-y-2">

          {/* Ban tổ chức */}
          <EventInput
            label="Ban tổ chức"
            value={form.organizer}
            onChange={handleFormChange('organizer')}
            placeholder="Nhập tên ban tổ chức"
          />

          {/* Tên sự kiện */}
          <EventInput
            label="Tên sự kiện"
            value={form.title}
            onChange={handleFormChange('title')}
            placeholder="Nhập tên sự kiện"
          />

          {/* Mô tả */}
          <EventInput
            label="Mô tả"
            type="textarea"
            value={form.description}
            onChange={handleFormChange('description')}
            placeholder="Nhập mô tả sự kiện"
          />

          {/* Địa chỉ */}
          <EventInput
            label="Địa chỉ"
            value={form.address}
            onChange={handleFormChange('address')}
            placeholder="Nhập địa điểm diễn ra sự kiện"
          />

          {/* Thời gian diễn ra */}
          <EventInput
            label="Thời gian diễn ra"
            type="datetime-local"
            value={form.startTime}
            onChange={handleFormChange('startTime')}
          />
          {form.startTime && new Date(form.startTime) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? (
            <p className="text-red-400 text-[13px] font-bold mt-[-12px] mb-5">
               Thời gian bắt đầu sự kiện phải cách hiện tại ít nhất 1 tuần (7 ngày)!
            </p>
          ) : (
            <p className="text-gray-400 text-[13px] mt-[-12px] mb-5 italic">
              * Lưu ý: Thời gian bắt đầu phải cách hiện tại ít nhất 1 tuần (7 ngày).
            </p>
          )}

          {/* Thể loại */}
          <EventInput
            label="Thể loại sự kiện"
            type="select"
            placeholder="Chọn loại sự kiện"
            value={form.categoryId}
            onChange={handleFormChange('categoryId')}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          {/* Ảnh banner */}
          <div className="mb-8 pt-2">
            <label className="text-white font-bold text-[20px] block mb-3">
              Ảnh banner{' '}
              <span className="text-gray-400 font-normal text-[20px] italic ml-1">
                (Lưu ý: nên để ảnh theo tỷ lệ chuẩn xắp xỉ 2:1 để đạt hiệu quả hiển thị cao nhất)
              </span>
            </label>

            {/* Hidden file input */}
            <input
              ref={bannerInputRef}
              type="file"
              id="banner-upload"
              className="hidden"
              accept="image/*"
              onChange={handleBannerChange}
            />

            {bannerPreview ? (
              /* Preview mode — click overlay để đổi ảnh */
              <div
                className="relative w-full max-w-[600px] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
              >
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-auto block"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-bold bg-black/60 px-4 py-2 rounded-full">
                    Thay đổi ảnh banner
                  </span>
                </div>
                {/* X button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveBanner(); }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Upload button */
              <label
                htmlFor="banner-upload"
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#8D8D8D] hover:bg-white/20 text-white text-[13px] font-bold font-medium rounded-xl cursor-pointer transition-colors border border-white/5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm ảnh mới
              </label>
            )}
          </div>

          {/* Lịch trình sự kiện */}
          <div className="pt-6 border-t border-white/5 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-[20px]">Lịch trình sự kiện</h3>
              <button
                type="button"
                onClick={handleAddSession}
                className="px-4 py-1.5 bg-[#8D8D8D] hover:bg-white/20 text-white text-[13px] font-bold font-medium rounded-xl transition-colors border border-white/5"
              >
                Thêm phiên sự kiện
              </button>
            </div>

            <div className="space-y-4">
              {sessions.map((s, index) => (
                <EventSessionForm
                  key={s.id}
                  index={index + 1}
                  data={s.data}
                  onChange={(data) => handleSessionChange(s.id, data)}
                  onRemove={() => handleRemoveSession(s.id)}
                  canRemove={sessions.length > 1}
                />
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm bg-[#1a1a1a] rounded-lg border border-white/5">
                  Chưa có phiên sự kiện nào.
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-[#00a3ff] hover:bg-[#0090FF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-full transition-colors shadow-lg shadow-[#00a3ff]/20"
            >
              {submitting ? 'Đang tạo...' : 'Tạo ma trận ghế'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;