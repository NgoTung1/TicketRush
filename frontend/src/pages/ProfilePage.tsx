import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { userApi, UpdateProfilePayload } from '@/api/userApi';
import ImageCropper from '@/components/ui/ImageCropper';

const GENDER_OPTIONS = [
  { value: '', label: 'Chọn giới tính' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchUserProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);

  // Cropper state
  const [cropperImage, setCropperImage] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setBirthDate(user.birthDate || '');
      setGender(user.gender || '');
      setEmail(user.email || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCropperImage(objectUrl);
    e.target.value = '';
  };

  // Handle crop done
  const handleCropDone = (blob: Blob) => {
    setAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
    setCropperImage(null);
    setIsEditing(true);
  };

  // Handle crop cancel
  const handleCropClose = () => {
    if (cropperImage) URL.revokeObjectURL(cropperImage);
    setCropperImage(null);
  };

  // Check if any field changed
  const hasChanges = (): boolean => {
    if (!user) return false;
    return (
      fullName !== (user.fullName || '') ||
      phone !== (user.phone || '') ||
      birthDate !== (user.birthDate || '') ||
      gender !== (user.gender || '') ||
      avatarBlob !== null
    );
  };

  // Save profile
  const handleSave = async () => {
    if (!hasChanges()) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const payload: UpdateProfilePayload = {
        fullName: fullName || null,
        gender: gender || null,
        phone: phone || null,
        birthDate: birthDate || null,
      };
      await userApi.updateProfile(payload, avatarBlob || undefined);
      await fetchUserProfile();
      setAvatarBlob(null);
      setIsEditing(false);
      setSaveMessage('Cập nhật thành công!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      setSaveMessage('Cập nhật thất bại. Vui lòng thử lại.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  // Avatar display
  const getAvatarDisplay = () => {
    if (avatarPreview) {
      return (
        <img
          src={avatarPreview}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    const initial = fullName?.charAt(0)?.toUpperCase() || 'U';
    return (
      <span className="text-3xl font-bold text-white">{initial}</span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-[#0e0e0e] py-10 px-4">
      <div className="max-w-[520px] mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-[#2A2A2A] border-2 border-[#3a3a3a] flex items-center justify-center overflow-hidden">
              {getAvatarDisplay()}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                absolute inset-0 rounded-full flex items-center justify-center
                bg-black/50 opacity-0 group-hover:opacity-100
                transition-opacity duration-200 cursor-pointer
              "
              aria-label="Thay đổi ảnh đại diện"
            >
              <Camera size={22} className="text-white/80" />
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          {/* Name + edit icon */}
          <div className="flex items-center gap-2 mt-3">
            <h2 className="text-lg font-semibold text-white">
              {fullName || 'Anonymous'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-tr-text-muted hover:text-tr-accent transition-colors duration-200"
              aria-label="Chỉnh sửa tên"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>

        {/* ── Form Fields ─────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white font-medium mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="
                w-full bg-[#606060] text-sm text-white/60
                rounded-lg px-3 py-3 outline-none
                border border-[#3a3a3a] cursor-not-allowed
              "
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs text-white font-medium mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setIsEditing(true); }}
              placeholder="Nhập số điện thoại"
              className="
                w-full bg-[#606060] text-sm text-white
                placeholder:text-white/40
                rounded-lg px-3 py-3 outline-none
                border border-[#3a3a3a] focus:border-tr-accent/60
                transition-all duration-200
              "
            />
          </div>

          {/* Birth date */}
          <div>
            <label className="block text-xs text-white font-medium mb-1.5">
              Ngày sinh
            </label>
            <div className="relative">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => { setBirthDate(e.target.value); setIsEditing(true); }}
                className="
                  w-full bg-[#606060] text-sm text-white
                  rounded-lg px-3 py-3 outline-none
                  border border-[#3a3a3a] focus:border-tr-accent/60
                  transition-all duration-200
                  [color-scheme:dark]
                "
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs text-white font-medium mb-1.5">
              Giới tính
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setIsEditing(true); }}
                className="
                  w-full bg-[#606060] text-sm text-white
                  rounded-lg px-3 py-3 outline-none appearance-none
                  border border-[#3a3a3a] focus:border-tr-accent/60
                  transition-all duration-200 cursor-pointer
                "
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#2a2a2a]">
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Dropdown arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save Button ─────────────────────────────────── */}
        {isEditing && hasChanges() && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="
                px-8 py-2.5 rounded-full
                bg-tr-accent text-white font-bold text-sm
                hover:bg-tr-accent-hover transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                'Cập nhật thay đổi'
              )}
            </button>
          </div>
        )}

        {/* Save message */}
        {saveMessage && (
          <p className={`mt-4 text-center text-sm ${saveMessage.includes('thành công') ? 'text-green-400' : 'text-red-400'}`}>
            {saveMessage}
          </p>
        )}
      </div>

      {/* ── Image Cropper Modal ──────────────────────────── */}
      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropDone={handleCropDone}
          onClose={handleCropClose}
          aspect={1}
          cropShape="round"
        />
      )}
    </div>
  );
};

export default ProfilePage;
