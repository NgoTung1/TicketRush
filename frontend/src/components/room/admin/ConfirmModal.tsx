interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ isOpen, onClose, onConfirm }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#383838] w-[550px] p-6 rounded-2xl relative shadow-2xl border border-gray-800 text-center">
        <h2 className="text-[24px] font-bold mb-4 text-white">Xác nhận tạo sơ đồ ghế</h2>
        <p className="text-[20px] font-bold text-white mb-6 leading-relaxed">
          Bạn có chắc chắn muốn tạo sơ đồ ghế không? <br />
          <span className="text-[#ff5757] font-bold">Bạn sẽ không thể chỉnh sửa sơ đồ ghế sau khi đã tạo.</span>
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="bg-[#777777] border border-gray-600 hover:border-gray-400 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#ff5757] hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
