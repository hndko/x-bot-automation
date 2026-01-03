# X Bot Helper - Extension Reload Guide

## ⚠️ IMPORTANT: Harus Reload Extension!

Setiap kali code berubah, Anda HARUS reload extension untuk melihat perubahan.

### Steps:

1. **Buka Chrome Extensions Page:**

   - URL: `chrome://extensions/`
   - Atau Menu → More Tools → Extensions

2. **Find "X Bot Helper"**

3. **Click Reload Icon (↻)**

   - Atau toggle OFF kemudian ON

4. **Reload Twitter Page:**

   - Tekan F5 atau Ctrl+R
   - Atau close dan buka tab baru

5. **Verify:**

   - Buka Console (F12)
   - Harus lihat: "X Bot Helper: Content script loaded"
   - Harus lihat: "👨‍💻 Made by Kyoo | 🏢 Mari Partner"

6. **Run Delete Replies Again**
   - Sekarang harus lihat debug logs lengkap!

---

## Expected Debug Output:

```
🔍 === ANALYZING TWEET ===
Tweet text preview: "..."
Has more button (yours): true/false
Has @ mentions: true/false
Checking N text elements...
  [0]: "..."
  [1]: "..."
Found N aria-labels
  Aria: "..."

➡️ FINAL DECISION: isReply = true/false
```

## Jika Masih Tidak Ada Debug Logs:

1. Clear browser cache
2. Hard reload: Ctrl+Shift+R
3. Restart Chrome completely
4. Check Console untuk error messages
