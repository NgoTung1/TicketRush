import React, { useState } from 'react';
import EventInput from '../../components/event/EventInput';
import EventSessionForm from '../../components/event/EventSessionForm';

const CreateEventPage: React.FC = () => {
    const [sessions, setSessions] = useState([1, 2, 3]);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    const handleAddSession = () => {
        setSessions([...sessions, sessions.length > 0 ? Math.max(...sessions) + 1 : 1]);
    };

    const handleRemoveSession = (id: number) => {
        setSessions(sessions.filter(s => s !== id));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate image upload preview
            setBannerUrl("https://picsum.photos/seed/adminbanner/800/400");
        }
    };

    return (
        <div className="bg-[#141414] min-h-screen text-white font-roboto pb-12">
            {/* Header mock to match the image */}
            <header className="bg-[#1a1a1a] border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6 sm:gap-10">
                    <h1 className="text-[#00a3ff] font-black text-lg sm:text-xl italic tracking-tighter cursor-pointer">
                        TICKETRUSH
                    </h1>
                    <nav className="hidden sm:flex gap-6 text-[13px] font-medium">
                        <a href="#" className="text-white">Quản lý sự kiện</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Quản lý danh mục</a>
                    </nav>
                </div>
                <div>
                    {/* Avatar mock */}
                    <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden border border-white/20 cursor-pointer">
                        <img src="https://picsum.photos/seed/avatar/100" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-8">Thông tin sự kiện</h2>

                <div className="space-y-1">
                    <EventInput label="Ban tổ chức" placeholder="Nhập tên ban tổ chức" />
                    <EventInput label="Tên sự kiện" placeholder="Nhập tên sự kiện" />
                    <EventInput label="Mô tả" type="textarea" placeholder="Nhập mô tả sự kiện" />
                    <EventInput label="Địa chỉ" placeholder="Nhập địa điểm diễn ra sự kiện" />

                    <EventInput
                        label="Thời gian diễn ra"
                        type="text"
                        placeholder="📅 Chọn khoảng thời gian..."
                    />

                    <EventInput
                        label="Thể loại sự kiện"
                        type="select"
                        placeholder="Chọn loại sự kiện"
                        options={['Âm nhạc', 'Nghệ thuật', 'Hội thảo', 'Thể thao']}
                    />

                    <div className="mb-8 pt-2">
                        <label className="text-white font-bold text-[15px] block mb-3">
                            Ảnh banner <span className="text-gray-400 font-normal text-[13px] italic ml-1">(Lưu ý: nên để ảnh theo tỷ lệ chuẩn sắp xỉ 2:1 để đạt hiệu quả hiển thị cao nhất)</span>
                        </label>

                        {bannerUrl ? (
                            <div className="relative w-full max-w-[600px] bg-[#2a2a2a] rounded-lg p-2 border border-white/5">
                                <img src={bannerUrl} alt="Banner preview" className="w-full h-auto rounded-md shadow-md" />
                                <button
                                    onClick={() => setBannerUrl(null)}
                                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="file"
                                    id="banner-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <label
                                    htmlFor="banner-upload"
                                    className="inline-block px-5 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 hover:text-white text-[13px] font-medium rounded cursor-pointer transition-colors border border-white/5 shadow-sm"
                                >
                                    Chọn file tải lên
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-[15px]">Lịch trình sự kiện</h3>
                            <button
                                onClick={handleAddSession}
                                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium rounded transition-colors border border-white/5"
                            >
                                Thêm phiên sự kiện
                            </button>
                        </div>

                        <div className="space-y-4">
                            {sessions.map((id, index) => (
                                <EventSessionForm
                                    key={id}
                                    index={index + 1}
                                    onRemove={() => handleRemoveSession(id)}
                                />
                            ))}

                            {sessions.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm bg-[#1a1a1a] rounded-lg border border-white/5">
                                    Chưa có phiên sự kiện nào. Hãy thêm phiên sự kiện mới.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button className="px-8 py-2.5 bg-[#00a3ff] hover:bg-[#0090FF] text-white text-[14px] font-bold rounded-full transition-colors shadow-lg shadow-[#00a3ff]/20">
                            Lưu sự kiện
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEventPage;
