# 🔒 Frontend Security Checklist

## Data & API
- [ ] Không hardcode API key trong code.
- [ ] API gọi qua HTTPS.
- [ ] Escape dữ liệu khi render (tránh XSS).

## Code
- [ ] Tránh `dangerouslySetInnerHTML` (chỉ dùng khi bắt buộc).
- [ ] Kiểm tra bundle không chứa thông tin nhạy cảm.

## Build
- [ ] Xoá console.log trước khi build.
- [ ] Review dependencies, gỡ package thừa.
