# Testing Checklist ✅

Terima kasih sudah mau testing! Berikut checklist untuk testing extension:

## 🧪 Pre-Testing Setup

- [ ] Extension sudah ter-install di Chrome
- [ ] Extension sudah di-reload (setelah fix terbaru)
- [ ] Login ke Twitter/X di Chrome
- [ ] Berada di halaman Twitter/X (bukan halaman lain)

## 🎯 Test Scenarios

### Test 1: Basic Functionality

- [ ] Click extension icon
- [ ] Popup muncul dengan UI purple gradient
- [ ] Semua tombol visible (Delete, Unretweet, Unlike)
- [ ] Settings bisa diubah (Delay, Batch Size, Max Actions)

### Test 2: Delete Posts (CAREFUL!)

**Recommendation:** Test dengan akun dummy atau set Max Actions = 1

- [ ] Navigate ke profile page Anda
- [ ] Click "Delete Posts" button
- [ ] Confirm dialog muncul
- [ ] Click OK
- [ ] Status berubah jadi "🔄 Starting..."
- [ ] Progress bar bergerak
- [ ] Statistics update (Processed/Success/Failed)
- [ ] Post berhasil terhapus
- [ ] Status jadi "✅ Completed!"

### Test 3: Undo Retweets

**Recommendation:** Retweet 1-2 post dulu untuk testing

- [ ] Di halaman manapun (home/profile)
- [ ] Click "Undo Retweets" button
- [ ] Process berjalan
- [ ] Retweet berhasil di-undo
- [ ] Statistics update correctly

### Test 4: Undo Likes

**Recommendation:** Like 1-2 post dulu untuk testing

- [ ] Di halaman manapun
- [ ] Click "Undo Likes" button
- [ ] Auto-navigate ke /likes page (atau sudah di sana)
- [ ] Process berjalan
- [ ] Likes berhasil di-unlike
- [ ] Statistics update

### Test 5: Error Handling

- [ ] Test di halaman non-Twitter (should show error)
- [ ] Test dengan Twitter page belum load (should handle gracefully)
- [ ] Test dengan limit = 0 (should process all)

### Test 6: Safety Features

- [ ] Set delay = 10 seconds, verify ada delay antar actions
- [ ] Set batch size = 5, verify ada rest setelah 5 actions
- [ ] Set max actions = 3, verify berhenti setelah 3 actions

## 🐛 Bugs to Report

Jika ada error, tolong report dengan detail:

### Format Report:

```
❌ Error: [Nama error]

Steps to reproduce:
1. ...
2. ...
3. ...

Expected: [Apa yang diharapkan]
Actual: [Apa yang terjadi]

Console errors (F12):
[Copy paste error dari console]

Screenshot: [Jika ada]
```

## 💡 What to Check in Console

Press **F12** → **Console tab** dan cek:

- [ ] Apakah ada error messages (merah)
- [ ] Apakah content script loaded ("X Bot Helper: Content script loaded")
- [ ] Apakah ada warning dari Twitter

## ⚠️ Known Limitations

These are expected behaviors:

- Processing might be slow (karena delays for safety)
- Some tweets might be skipped (if structure different)
- Progress might jump (normal untuk scrolling)
- Extension perlu reload jika Twitter update structure

## 📝 Success Criteria

Extension dianggap sukses jika:

- ✅ Semua 3 actions bisa berjalan
- ✅ No critical errors
- ✅ Statistics update correctly
- ✅ Actions complete successfully
- ✅ No Twitter account warnings/locks

## 🎉 After Testing

Report hasil testing dengan format:

```
✅ Tested: [Date & Time]
Browser: Chrome [version]
Twitter Page: [URL tested]

Results:
- Delete Posts: [✅ / ❌] + notes
- Undo Retweets: [✅ / ❌] + notes
- Undo Likes: [✅ / ❌] + notes

Issues found: [List issues or "None"]

Overall: [Working / Needs fixes]
```

---

**Thank you for testing!** 🙏

Your feedback akan sangat membantu improve extension!
