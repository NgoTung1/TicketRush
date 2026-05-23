import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventSessionForm, { SessionFormData } from '../../components/event/EventSessionForm';
import EventInput from '../../components/event/EventInput';
import { eventApi, EventUpdateRequest } from '../../api/eventApi';
import { eventSessionApi, EventSessionCreateRequest, EventSessionUpdateRequest } from '../../api/eventSessionApi';
import { categoryApi, CategoryResponse } from '../../api/categoryApi';
import { zoneApi } from '../../api/zoneApi';
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
  maxTicketPerUser: number;
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
    maxTicketPerUser: 8,
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
  const [hasSeatMatrix, setHasSeatMatrix] = useState(false);
  const [firstSessionId, setFirstSessionId] = useState<string>('');

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

        // Chỉ cho phép cập nhật nếu sự kiện ở trạng thái chuẩn bị (ONCOMING)
        if (e.status !== 'ONCOMING') {
          navigate('/admin/event-list', { replace: true });
          return;
        }

        setForm({
          organizer: e.organizer || '',
          title: e.title || '',
          description: e.description || '',
          address: e.address || '',
          startTime: e.startTime ? e.startTime.slice(0, 16) : '',
          categoryId: e.categoryId || '',
          status: e.status || 'ONCOMING',
          maxTicketPerUser: e.maxTicketPerUser || 8,
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
              startAt: s.startAt ? s.startAt.slice(0, 16) : '',
              endAt: s.endAt ? s.endAt.slice(0, 16) : '',
            },
          }))
        );

        // 4. Kiểm tra sơ đồ ghế của sự kiện (lấy khu vực của suất diễn đầu tiên)
        if (sessList.length > 0) {
          try {
            const firstSess = sessList[0];
            const zonesRes: any = await zoneApi.getZonesBySessionId(firstSess.id);
            const zoneList = Array.isArray(zonesRes) ? zonesRes : zonesRes?.data ?? [];
            if (zoneList.length > 0) {
              setHasSeatMatrix(true);
              setFirstSessionId(firstSess.id);
            }
          } catch (zoneErr) {
            console.error("Lỗi tải thông tin sơ đồ ghế:", zoneErr);
          }
        }
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
  ) => {
    let value: any = e.target.value;
    if (field === 'maxTicketPerUser') {
      if (value === '') {
        value = '';
      } else {
        value = parseInt(value, 10);
        if (isNaN(value) || value <= 0) value = 8;
      }
    }
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
    if (!form.startTime) return setError('Vui lòng chọn thời gian diễn ra.');

    const eventStartTime = new Date(form.startTime);
    const now = new Date();
    const minEventStartTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    if (eventStartTime < minEventStartTime) {
      return setError('Thời gian bắt đầu sự kiện phải ít nhất 1 tuần sau thời điểm hiện tại!');
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
      const eventData: EventUpdateRequest = {
        title: form.title.trim(),
        categoryId: form.categoryId,
        organizer: form.organizer.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        startTime: form.startTime ? (form.startTime.length === 16 ? `${form.startTime}:00` : form.startTime) : undefined,
        status: form.status as any,
        maxTicketPerUser: form.maxTicketPerUser || 8,
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
            startAt: s.data.startAt.length === 16 ? `${s.data.startAt}:00` : s.data.startAt,
            endAt: s.data.endAt 
              ? (s.data.endAt.length === 16 ? `${s.data.endAt}:00` : s.data.endAt) 
              : (s.data.startAt.length === 16 ? `${s.data.startAt}:00` : s.data.startAt),
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
      const serverError = err?.response?.data;
      if (typeof serverError === 'string') {
        setError(serverError);
      } else {
        setError(serverError?.message || 'Cập nhật sự kiện thất bại.');
      }
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
          {form.startTime && new Date(form.startTime) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? (
            <p className="text-red-400 text-[13px] font-bold mt-[-12px] mb-5">
              ⚠️ Thời gian bắt đầu sự kiện phải cách hiện tại ít nhất 1 tuần (7 ngày)!
            </p>
          ) : (
            <p className="text-gray-400 text-[13px] mt-[-12px] mb-5 italic">
              * Lưu ý: Thời gian bắt đầu phải cách hiện tại ít nhất 1 tuần (7 ngày).
            </p>
          )}
          <EventInput
            label="Số lượng vé tối đa/người"
            type="number"
            value={form.maxTicketPerUser.toString()}
            onChange={handleFormChange('maxTicketPerUser')}
            placeholder="Mặc định: 8"
          />
          <EventInput
            label="Thể loại sự kiện"
            type="select"
            value={form.categoryId}
            onChange={handleFormChange('categoryId')}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <EventInput
            label="Trạng thái sự kiện"
            type="select"
            value={form.status}
            onChange={handleFormChange('status')}
            options={[
              { value: 'ONCOMING', label: 'Đang chuẩn bị' },
              { value: 'ONGOING', label: 'Đang mở bán' },
              { value: 'COMPLETED', label: 'Đã hoàn thành' },
              { value: 'CANCELLED', label: 'Đã hủy' }
            ]}
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

          {/* Sơ đồ ghế */}
          <div className="pt-6 border-t border-white/5 mt-8">
            <h3 className="text-white font-bold text-[20px] mb-4">Sơ đồ ghế</h3>
            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-[16px]">Cấu hình sơ đồ ghế</p>
                <p className="text-gray-400 text-[13px] mt-1">
                  {hasSeatMatrix 
                    ? "Sự kiện này đã có cấu hình sơ đồ ghế." 
                    : "Sự kiện này chưa có cấu hình sơ đồ ghế. Bạn có thể tạo sơ đồ ghế mới."}
                </p>
              </div>
              <div>
                {hasSeatMatrix ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/event/${id}/session/${firstSessionId}/room`)}
                    className="px-6 py-2 bg-[#00e676] hover:bg-[#00c853] text-white text-[13px] font-bold rounded-xl transition-colors"
                  >
                    Xem chi tiết sơ đồ
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={sessions.length === 0}
                    onClick={() => navigate(`/admin/event/room/${id}`)}
                    className="px-6 py-2 bg-[#00a3ff] hover:bg-[#0090FF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-colors"
                  >
                    Tạo sơ đồ ghế
                  </button>
                )}
              </div>
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
