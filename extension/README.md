# X Bot Helper - Chrome Extension

## 🎉 Congratulations!

Sekarang Anda punya **Chrome Extension** yang **JAUH LEBIH AMAN** daripada Puppeteer bot!

## ✅ Kenapa Ini Lebih Baik?

| Puppeteer Bot                   | Chrome Extension                      |
| ------------------------------- | ------------------------------------- |
| ❌ Automated browser terdeteksi | ✅ Browser Chrome asli                |
| ❌ Cookies bisa invalid         | ✅ Pakai session yang sudah login     |
| ❌ Fingerprint berbeda          | ✅ Fingerprint = Chrome normal        |
| ❌ High risk banned             | ✅ Much safer (tapi tetap hati-hati!) |

## 📦 Cara Install Extension

### Step 1: Buka Chrome Extensions

1. Buka Chrome browser
2. Ketik di address bar: `chrome://extensions/`
3. Atau: Menu (⋮) → Extensions → Manage Extensions

### Step 2: Enable Developer Mode

1. Di pojok kanan atas, aktifkan **Developer mode** (toggle switch)

### Step 3: Load Extension

1. Klik **Load unpacked**
2. Navigate ke folder: `/Applications/ServBay/www/x-bot-automation/extension/`
3. Klik **Select**

### Step 4: Pin Extension (Optional)

1. Klik icon puzzle (🧩) di toolbar Chrome
2. Find "X Bot Helper"
3. Klik icon pin untuk pin ke toolbar

## 🚀 Cara Menggunakan

### Persiapan:

1. **Login ke Twitter/X di Chrome** seperti biasa
2. Pastikan sudah masuk ke account Anda
3. Navigate ke halaman yang sesuai:
   - Delete Posts → Go to your profile
   - Undo Retweets → Stay di halaman manapun
   - Undo Likes → Extension akan auto-navigate

### Menggunakan Extension:

1. **Klik icon X Bot Helper** di toolbar Chrome
2. **Set your preferences:**

   - Delay: 5 seconds (recommended)
   - Batch Size: 20 (after 20 actions, rest 30 seconds)
   - Max Actions: 0 for all, or set limit

3. **Click action button:**

   - 🗑️ Delete Posts - Hapus postingan
   - 🔄 Undo Retweets - Batalkan retweet
   - 💔 Undo Likes - Unlike tweets

4. **Monitor progress** dalam popup
5. **Let it run!**

## ⚙️ Settings Explained

### Delay (seconds)

- Waktu tunggu antara setiap aksi
- **Recommended:** 5-10 seconds
- Terlalu cepat = risiko detection

### Batch Size

- Jumlah aksi sebelum istirahat
- **Recommended:** 20-50
- After batch, rest 30 seconds

### Max Actions

- Maksimum total aksi
- **0 = Unlimited** (process semua)
- Set limit untuk safety (e.g., 100)

## 🔒 Safety Tips

1. **Start Slow**

   - First time: max 10-20 actions
   - Lihat apakah ada masalah
   - Gradually increase

2. **Use Reasonable Delays**

   - Minimum 3 seconds
   - Recommended 5-10 seconds
   - Don't rush!

3. **Don't Overuse**

   - Max 100-200 actions per day
   - Don't run 24/7
   - Give breaks between sessions

4. **Monitor for Issues**
   - Watch for "Rate limit" messages
   - Stop if you see warnings
   - Twitter bisa temporary lock account

## 🐛 Troubleshooting

### "Please open Twitter/X page first"

→ You're not on twitter.com or x.com page

### Tidak ada progress

→ Reload page dan coba lagi

### Error "Cannot read properties..."

→ Twitter updated their HTML. Extension perlu update.

### Actions tidak jalan

→ Check console (F12) untuk errors

## ⚡ Advanced Tips

### For Delete Posts:

- Navigate to YOUR profile page first
- Extension akan detect dan mulai delete
- Posts di-delete dari yang terbaru

### For Undo Retweets:

- Bisa di halaman manapun
- Extension akan scroll dan cari retweets
- Auto-skip yang bukan retweet

### For Undo Likes:

- Extension auto-navigate ke /likes
- Scroll dari atas kebawah
- Unlike satu per satu

## 📊 Progress Tracking

Extension show real-time stats:

- **Processed:** Total yang sudah diproses
- **Success:** Berhasil
- **Failed:** Gagal (skip/error)

## 🎨 Customization

Mau ubah warna atau design?

- Edit `popup.html` untuk UI
- Edit colors di CSS section

## ⚠️ Important Notes

1. **Extension ini inject script ke Twitter page**

   - Running di YOUR session
   - Using YOUR logged-in account
   - Safer than automated browser

2. **Still violates ToS**

   - Automation tetap melanggar Twitter ToS
   - Tapi MUCH less detectable
   - Use at your own risk

3. **No guarantees**

   - Twitter bisa update page structure
   - Extension bisa break
   - Account bisa suspended (tapi unlikely)

4. **Backup penting!**
   - Consider download Twitter archive first
   - Before bulk delete

## 🔧 Updates & Maintenance

Jika Twitter update page structure:

1. Check browser console (F12) untuk errors
2. Update selectors di `content.js`
3. Reload extension

## 📞 Need Help?

1. Check console errors: F12 → Console tab
2. Review `content.js` untuk logic
3. Test dengan limit kecil dulu

---

**Selamat menggunakan! Ini jauh lebih aman daripada Puppeteer approach! 🎉**

Remember: Use responsibly, start slow, monitor results!
