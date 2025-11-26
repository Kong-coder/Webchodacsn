# Toast Notification System

## Usage

Replace all `alert()` calls with `showToast()` for better UX.

### Import

```javascript
import { showToast } from "../../components/Toast";
```

### Basic Usage

```javascript
// Success message
showToast('Lưu dịch vụ thành công!', 'success');

// Error message
showToast('Lưu dịch vụ thất bại', 'error');

// Warning message
showToast('Vui lòng kiểm tra lại thông tin', 'warning');

// Info message
showToast('Đang xử lý...', 'info');
```

### Toast Types

- `success` - Green toast with checkmark (✓)
- `error` - Red toast with X mark (✕)
- `warning` - Orange toast with warning icon (⚠)
- `info` - Blue toast with info icon (ℹ)

### Features

- Auto-dismiss after 3 seconds
- Click to dismiss manually
- Stacks multiple toasts
- Smooth slide-in animation
- Mobile responsive

### Examples

#### Replace alert() with showToast()

**Before:**
```javascript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error();
  alert('Success!');
} catch (error) {
  alert('Error!');
}
```

**After:**
```javascript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error();
  showToast('Success!', 'success');
} catch (error) {
  showToast('Error!', 'error');
}
```

#### Replace window.confirm() with custom modal (future enhancement)

For now, keep using `window.confirm()` for confirmation dialogs.
We can create a custom confirmation modal later if needed.

## Files Updated

- ✅ `Quanly.js` - All alerts replaced
- ✅ `BookingPage.js` - All alerts replaced
- ⏳ Other pages - TODO

## TODO

Replace alerts in these files:
- [ ] `CustomerManagement.js`
- [ ] `HRManagementSystem.js`
- [ ] `SpaProductManagement.js`
- [ ] `BookingManagement.js`
- [ ] `LoginPage.js`
- [ ] Other pages with alert() calls
