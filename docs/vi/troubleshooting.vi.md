# Hướng Dẫn Khắc Phục Sự Cố CCS

## Vấn Đề Riêng Của Windows

### PowerShell Execution Policy

Nếu bạn thấy "cannot be loaded because running scripts is disabled":

```powershell
# Kiểm tra policy hiện tại
Get-ExecutionPolicy

# Cho phép user hiện tại chạy scripts (khuyến nghị)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Hoặc chạy với bypass (một lần)
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.ccs\ccs.ps1" glm
```

### PATH chưa được cập nhật (Windows)

Nếu lệnh `ccs` không tìm thấy sau khi cài đặt:

1. Khởi động lại terminal của bạn
2. Hoặc thêm thủ công vào PATH:
   - Mở "Edit environment variables for your account"
   - Thêm `%USERPROFILE%\.ccs` vào User PATH
   - Khởi động lại terminal

### Claude CLI không tìm thấy (Windows)

```powershell
# Kiểm tra Claude CLI
where.exe claude

# Nếu thiếu, cài đặt từ tài liệu Claude
```

## Vấn Đề Cài Đặt

### Lỗi BASH_SOURCE unbound variable

Lỗi này xảy ra khi chạy installer trong một số shells hoặc môi trường.

**Đã sửa trong phiên bản mới nhất**: Installer bây giờ xử lý cả thực thi qua pipe (`curl | bash`) và thực thi trực tiếp (`./install.sh`).

**Giải pháp**: Nâng cấp lên phiên bản mới nhất:
```bash
curl -fsSL https://raw.githubusercontent.com/kaitranntt/ccs/main/installers/install.sh | bash
```

### Git worktree không được phát hiện

Nếu cài từ git worktree hoặc submodule, các phiên bản cũ có thể không phát hiện repository git.

**Đã sửa trong phiên bản mới nhất**: Installer bây giờ phát hiện cả thư mục `.git` (clone chuẩn) và file `.git` (worktree/submodule).

**Giải pháp**: Nâng cấp lên phiên bản mới nhất hoặc dùng phương pháp cài đặt curl.

## Vấn Đề Cấu Hình

### Không tìm thấy profile

```
Error: Profile 'foo' not found in ~/.ccs/config.json
```

**Fix**: Thêm profile vào `~/.ccs/config.json`:
```json
{
  "profiles": {
    "foo": "~/.ccs/foo.settings.json"
  }
}
```

### Thiếu file settings

```
Error: Settings file not found: ~/.ccs/foo.settings.json
```

**Fix**: Tạo file settings hoặc sửa đường dẫn trong config.

### jq chưa được cài đặt

```
Error: jq is required but not installed
```

**Fix**: Cài đặt jq (xem hướng dẫn cài đặt).

**Lưu ý**: Installer tạo các mẫu cơ bản ngay cả khi không có jq, nhưng các tính năng nâng cao cần jq.

## Vấn Đề Cấu Hình PATH

### Cấu Hình PATH Tự Động

v2.2.0+ tự động cấu hình shell PATH. Nếu bạn thấy hướng dẫn reload sau khi cài, hãy làm theo:

**Cho bash**:
```bash
source ~/.bashrc
```

**Cho zsh**:
```bash
source ~/.zshrc
```

**Cho fish**:
```fish
source ~/.config/fish/config.fish
```

**Hoặc mở cửa sổ terminal mới** (PATH tự động load).

### PATH Chưa Được Cấu Hình

Nếu lệnh `ccs` không tìm thấy sau khi cài và reload:

**Xác minh PATH entry tồn tại**:
```bash
# Cho bash/zsh
grep "\.local/bin" ~/.bashrc ~/.zshrc

# Cho fish
grep "\.local/bin" ~/.config/fish/config.fish
```

**Sửa thủ công** (nếu auto-config thất bại):

Bash:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Zsh:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Fish:
```fish
echo 'set -gx PATH $HOME/.local/bin $PATH' >> ~/.config/fish/config.fish
source ~/.config/fish/config.fish
```

### Shell Profile Sai

Nếu auto-config thêm vào file sai:

**Tìm profile đang active**:
```bash
echo $SHELL  # Hiển thị shell hiện tại
```

**Tình huống phổ biến**:
- macOS bash dùng `~/.bash_profile` (không phải `~/.bashrc`)
- Shell tùy chỉnh cần config thủ công
- Tmux/screen có thể dùng shell khác

**Giải pháp**: Thêm PATH thủ công vào file profile đúng.

### Shell Không Được Phát Hiện

Nếu installer không thể phát hiện shell:

**Triệu chứng**:
- Không có cảnh báo PATH hiển thị
- Lệnh `ccs` không tìm thấy sau khi cài

**Giải pháp**: Thiết lập PATH thủ công (xem ở trên).

### Thiếu profile mặc định

```
Error: Profile 'default' not found in ~/.ccs/config.json
```

**Fix**: Thêm profile "default" hoặc luôn chỉ định tên profile:
```json
{
  "profiles": {
    "default": "~/.claude/settings.json"
  }
}
```

## Vấn Đề Phổ Biến

### Claude CLI không tìm thấy

```
Error: claude command not found
```

**Giải pháp**: Cài đặt Claude CLI từ [tài liệu chính thức](https://docs.claude.com/en/docs/claude-code/installation).

### Permission denied (Unix)

```
Error: Permission denied: ~/.local/bin/ccs
```

**Giải pháp**: Cho phép script thực thi:
```bash
chmod +x ~/.local/bin/ccs
```

### Không tìm thấy file config

```
Error: Config file not found: ~/.ccs/config.json
```

**Giải pháp**: Chạy lại installer hoặc tạo config thủ công:
```bash
mkdir -p ~/.ccs
echo '{"profiles":{"default":"~/.claude/settings.json"}}' > ~/.ccs/config.json
```

## Nhận Trợ Giúp

Nếu bạn gặp các vấn đề không được đề cập ở đây:

1. Kiểm tra [GitHub Issues](https://github.com/kaitranntt/ccs/issues)
2. Tạo issue mới với:
   - Hệ điều hành của bạn
   - Phiên bản CCS (`ccs --version`)
   - Thông báo lỗi chính xác
   - Các bước để tái tạo vấn đề

## Chế Độ Debug

Bật verbose output để khắc phục sự cố:

```bash
ccs --verbose glm
```

Điều này sẽ hiển thị:
- File config nào đang được đọc
- Profile nào đang được chọn
- File settings nào đang được sử dụng
- Lệnh chính xác đang được thực thi

## Tắt Output Có Màu

Nếu output có màu gây vấn đề trong terminal hoặc logs của bạn:

```bash
export NO_COLOR=1
ccs glm
```

**Trường Hợp Sử Dụng**:
- Môi trường CI/CD
- Tạo log file
- Terminal không hỗ trợ màu
- Tùy chọn trợ năng