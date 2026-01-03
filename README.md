# X Bot Helper - Chrome Extension 🤖

**Safe Twitter/X Automation via Chrome Extension**

## 🎯 Overview

X Bot Helper adalah Chrome Extension yang membantu Anda melakukan bulk actions di Twitter/X dengan cara yang **LEBIH AMAN** daripada menggunakan automated browser.

### Fitur:

- 🗑️ **Delete Posts** - Bulk delete posting lama
- 🔄 **Undo Retweets** - Batalkan semua retweets
- 💔 **Undo Likes** - Unlike semua tweets

### Keunggulan:

- ✅ Running di Chrome **ASLI** (bukan automated browser)
- ✅ Menggunakan session yang **SUDAH LOGIN**
- ✅ **Jauh lebih aman** dari deteksi Twitter
- ✅ Real-time progress tracking
- ✅ Customizable delays & limits

## 🚀 Quick Start

### 1. Install Extension

1. Buka Chrome browser
2. Navigate ke `chrome://extensions/`
3. Enable **Developer mode** (toggle di pojok kanan atas)
4. Click **Load unpacked**
5. Select folder: `/Applications/ServBay/www/x-bot-automation/extension/`
6. Extension installed! ✅

### 2. Pin to Toolbar (Optional)

1. Click icon puzzle (🧩) di Chrome toolbar
2. Find "X Bot Helper"
3. Click pin icon 📌

### 3. Use Extension

1. **Login to Twitter/X** di Chrome (login normal seperti biasa)
2. **Navigate to appropriate page:**
   - Delete Posts → Your profile page
   - Undo Retweets → Any page
   - Undo Likes → Any page (auto-navigate)
3. **Click extension icon** 🤖 di toolbar
4. **Configure settings:**
   - Delay: 5-10 seconds (recommended)
   - Batch Size: 20 actions before rest
   - Max Actions: 0 for unlimited, or set limit
5. **Click action button**
6. **Watch progress** in popup!

## ⚙️ Configuration

### Delay (seconds)

Waktu tunggu antara setiap aksi.

- **Minimum:** 3 seconds
- **Recommended:** 5-10 seconds
- **Safe:** 10+ seconds

### Batch Size

Jumlah aksi sebelum istirahat 30 detik.

- **Recommended:** 20-50 actions
- Setelah batch selesai, bot istirahat 30 detik

### Max Actions

Total maksimum aksi yang akan dilakukan.

- **0** = Process semua (unlimited)
- **Set limit** untuk safety (contoh: 100)

## 🛡️ Safety Tips

1. **Start Small**

   - First time: Set Max Actions = 10
   - Monitor hasilnya
   - Gradually increase

2. **Use Reasonable Delays**

   - Jangan terlalu cepat
   - 5-10 seconds is safe
   - Lebih lambat = lebih aman

3. **Don't Overuse**

   - Max 100-200 actions per day
   - Jangan run 24/7
   - Give account breaks

4. **Monitor for Issues**
   - Watch console for errors
   - Stop jika ada warning dari Twitter
   - Account bisa temporary locked jika overuse

## 📊 Features Detail

### Delete Posts

- Navigate ke YOUR profile page
- Extension akan detect posts
- Delete dari yang terbaru
- Skip pinned posts

### Undo Retweets

- Works from any page
- Scroll otomatis mencari retweets
- Undo satu per satu
- Skip non-retweets

### Undo Likes

- Auto-navigate ke /likes page
- Scroll dari atas ke bawah
- Unlike semua liked tweets
- Real-time counter

## 🐛 Troubleshooting

### "Please open Twitter/X page first"

**Solution:** Pastikan Anda di halaman twitter.com atau x.com

### Tidak ada progress / stuck

**Solution:**

- Reload halaman Twitter
- Click extension icon lagi
- Try again

### Error messages in console

**Solution:**

- Press F12 untuk buka console
- Check error messages
- Twitter mungkin update structure

### Rate limit warning

**Solution:**

- Stop immediately
- Wait 15-30 minutes
- Reduce batch size
- Increase delay

## ⚠️ Important Notes

### 1. Still Violates ToS

Automation tetap melanggar Twitter Terms of Service. Gunakan dengan bijak dan tanggung risiko sendiri.

### 2. No Guarantees

- Twitter bisa update page structure kapan saja
- Extension bisa break jika ada update
- Selectors perlu di-update

### 3. Much Safer Than Puppeteer

Extension ini running di:

- ✅ Browser Chrome ASLI
- ✅ Session yang SUDAH login manual
- ✅ Tidak ada automated browser detection
- ✅ Fingerprint = Chrome normal

### 4. Backup First

- Consider download Twitter archive sebelum bulk delete
- Settings → Your account → Download archive

## 🔧 Advanced

### Modify Selectors

Jika Twitter update structure, edit `content.js`:

```javascript
// Find delete button
const deleteButton = document.querySelector('[data-testid="Dropdown"]');

// Find unlike button
const unlikeButton = tweet.querySelector('[data-testid="unlike"]');
```

Update selectors sesuai dengan struktur HTML terbaru.

### Custom Styling

Edit `popup.html` untuk ubah warna/design:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📁 Project Structure

```
x-bot-automation/
├── extension/
│   ├── manifest.json       # Extension config
│   ├── popup.html          # UI popup
│   ├── popup.js            # Popup logic
│   ├── content.js          # Main automation logic
│   ├── background.js       # Background service worker
│   ├── icons/              # Extension icons
│   ├── README.md           # Detailed documentation
│   └── QUICK_START.md      # Quick guide
│
├── README.md               # This file
└── CONCLUSION.md           # Why extension > Puppeteer
```

## 🎓 Why Extension vs Puppeteer Bot?

| Feature        | Puppeteer Bot    | Chrome Extension  |
| -------------- | ---------------- | ----------------- |
| Detection Risk | ❌ High          | ✅ Low            |
| Browser Type   | Automated        | Real Chrome       |
| Session        | Cookies can fail | Already logged in |
| Fingerprint    | Different        | Normal Chrome     |
| User Control   | No visibility    | See everything    |
| Updates        | Complex          | Easy to modify    |

**Conclusion:** Extension approach is **10x safer and better**!

## 📝 License

Use at your own risk. This tool is for educational purposes.

## ⚡ Quick Commands

```bash
# Navigate to extension folder
cd /Applications/ServBay/www/x-bot-automation/extension/

# Edit content script
nano content.js

# Edit popup UI
nano popup.html

# Check manifest
cat manifest.json
```

## 🎉 Ready to Use!

Extension sudah siap dipakai. Install di Chrome dan mulai automasi yang lebih aman!

**Remember:**

- Start with small limits
- Use reasonable delays
- Monitor for issues
- Don't overuse

---

**Happy (Safe) Automating! 🚀**
