/**
 * k6 Load Test — TicketRush Queue System
 *
 * Mô phỏng N người cùng lúc vào hàng đợi mua vé.
 * Mỗi Virtual User (VU) có userId riêng biệt = "test_user_{số VU}"
 * → Không cần JWT, không cần tạo 200 tài khoản.
 *
 * Cách chạy:
 *   k6 run load-test-queue.js
 *   k6 run --vus 300 --duration 30s load-test-queue.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─── Cấu hình ────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:8081';
const EVENT_ID = 'e781a8fa-b7b3-434c-a429-265df84c14e8'; // ← Thay bằng UUID sự kiện thật

// Custom metrics
const activeRoomCount = new Counter('active_room_total');
const waitingRoomCount = new Counter('waiting_room_total');
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time_ms');

// ─── Kịch bản test ───────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    /**
     * Kịch bản 1: Spike — 300 người vào đồng thời trong 10 giây
     * Mong đợi: 200 → ACTIVE_ROOM, 100 → WAITING_ROOM
     */
    spike_300_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '200s', target: 150 }, // tăng lên 300 VU trong 100 giây
        { duration: '200s', target: 150 }, // giữ 300 VU trong 30 giây
        { duration: '5s', target: 0 }, // giảm về 0
      ],
    },
  },
  thresholds: {
    // 95% request phải hoàn thành trong 500ms
    http_req_duration: ['p(95)<500'],
    // Tỷ lệ lỗi dưới 1%
    http_req_failed: ['rate<0.01'],
    // Custom: response time trung bình dưới 200ms (Redis rất nhanh)
    response_time_ms: ['avg<200'],
  },
};

// ─── Logic chính (mỗi VU chạy hàm này) ──────────────────────────────────────
export default function () {
  // Nếu đã chạy xong 1 lần rồi thì không làm gì nữa (tránh loop)
  if (__ITER > 0) {
    sleep(10);
    return;
  }

  // __VU là biến đặc biệt của k6: số thứ tự của VU (1, 2, 3, ... 300)
  // → mỗi VU có userId duy nhất, không trùng nhau
  const userId = `test_user_${__VU}`;

  const url = `${BASE_URL}/api/public/load-test/${EVENT_ID}/join?userId=${userId}`;

  const startTime = Date.now();
  const res = http.post(url);
  const elapsed = Date.now() - startTime;

  responseTime.add(elapsed);

  // Kiểm tra HTTP status
  const ok = check(res, {
    'HTTP 200': (r) => r.status === 200,
    'body có status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!ok) {
    errorRate.add(1);
    console.error(`[VU ${__VU}] Lỗi: ${res.status} - ${res.body}`);
    sleep(1);
    return;
  }

  errorRate.add(0);

  // Phân loại kết quả
  const body = JSON.parse(res.body);
  if (body.status === 'ACTIVE_ROOM' || body.status === 'ALREADY_IN_ACTIVE') {
    activeRoomCount.add(1);
    console.log(`[VU ${__VU}] ✅ ACTIVE_ROOM — userId: ${userId}`);
  } else if (body.status === 'WAITING_ROOM' || body.status === 'ALREADY_IN_WAITING') {
    waitingRoomCount.add(1);
    console.log(`[VU ${__VU}] ⏳ WAITING_ROOM — userId: ${userId}`);
  } else {
    console.warn(`[VU ${__VU}] ⚠️ Trạng thái lạ: ${body.status}`);
  }

  // Cho VU ngủ thật lâu (10 phút) để giữ chỗ trong Redis/Active Room ảo mà không spam request tiếp
  sleep(600);
}

// ─── Chạy sau khi test xong (tóm tắt) ───────────────────────────────────────
export function handleSummary(data) {
  const active = data.metrics['active_room_total']?.values?.count || 0;
  const waiting = data.metrics['waiting_room_total']?.values?.count || 0;
  const p95 = data.metrics['http_req_duration']?.values?.['p(95)'] || 0;
  const avg = data.metrics['http_req_duration']?.values?.avg || 0;

  console.log('\n═══════════════════════════════════════');
  console.log('📊  KẾT QUẢ LOAD TEST QUEUE');
  console.log('═══════════════════════════════════════');
  console.log(`✅  ACTIVE_ROOM  : ${active} lượt   (giới hạn: 200)`);
  console.log(`⏳  WAITING_ROOM : ${waiting} lượt`);
  console.log(`⏱️   Response avg : ${avg.toFixed(1)}ms`);
  console.log(`⏱️   Response p95 : ${p95.toFixed(1)}ms`);
  console.log('═══════════════════════════════════════\n');

  return {}; // trả về {} để k6 vẫn in report mặc định
}
