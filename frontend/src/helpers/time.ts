export function formatUnblockTime(timestampSeconds: string | number): string {
  try {
    // Backend trả về số giây, hàm Date của JS cần số mili-giây nên phải nhân 1000
    const d = new Date(Number(timestampSeconds) * 1000);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = d.getFullYear();

    return `${hh}:${mm}:${ss} - ${dd}/${mo}/${yy}`;
  } catch {
    return 'Không xác định';
  }
}