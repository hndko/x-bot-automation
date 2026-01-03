# Recommended Settings Guide 🎯

## Quick Reference

### For Testing (Your Current Settings ✅)

```
Delay: 5 seconds
Batch Size: 20
Max Actions: 2-5
```

**Perfect untuk:** First time testing, verify everything works

---

### Small Cleanup (10-50 items)

```
Delay: 8 seconds
Batch Size: 10
Max Actions: 50
```

**Use case:** Delete beberapa old posts, cleanup minor retweets

---

### Medium Cleanup (50-200 items)

```
Delay: 5 seconds
Batch Size: 20
Max Actions: 100
```

**Use case:** Monthly cleanup, moderate undo retweets/likes

---

### Mass Cleanup (200+ items)

```
Delay: 5 seconds
Batch Size: 30
Max Actions: 500
```

**Use case:** Major cleanup, bulk unlike (safest for mass action)

---

## Per-Action Breakdown

### 🗑️ Delete Posts (Highest Risk)

**Conservative:**

- Delay: 10s
- Batch: 10
- Max: 20

**Moderate:**

- Delay: 8s
- Batch: 15
- Max: 50

**Aggressive:**

- Delay: 5s
- Batch: 20
- Max: 100

**Tips:**

- Start dengan max 10-20 posts
- Monitor Twitter warnings
- Gradually increase if safe

---

### 🔄 Undo Retweets (Medium Risk)

**Conservative:**

- Delay: 8s
- Batch: 15
- Max: 50

**Moderate:**

- Delay: 5s
- Batch: 20
- Max: 100

**Aggressive:**

- Delay: 3s
- Batch: 30
- Max: 200

**Tips:**

- Safer than delete posts
- Can be more aggressive
- Rest 30s every batch

---

### 💔 Undo Likes (Lowest Risk)

**Conservative:**

- Delay: 5s
- Batch: 20
- Max: 100

**Moderate:**

- Delay: 3s
- Batch: 30
- Max: 200

**Aggressive:**

- Delay: 3s
- Batch: 50
- Max: 500

**Tips:**

- Safest of all actions
- Can process many at once
- Rarely triggers bans

---

## Strategy Guide

### Gradual Increase Strategy

```
Day 1: Max 20 actions (test & monitor)
Day 2: Max 50 actions (if no issues)
Day 3: Max 100 actions (continue if safe)
Day 4+: Full speed 200-500 (if all good)
```

### Session Schedule

- Run 2-3 sessions per day MAX
- Wait 3-4 hours between sessions
- Full rest 1 day per week

### Best Times to Run

✅ **Recommended:**

- Night: 00:00 - 06:00 (less monitoring)
- Weekend
- Off-peak hours

❌ **Avoid:**

- Peak hours: 12:00 - 18:00
- Right after posting
- After Twitter updates

---

## Warning Signs - STOP Immediately!

❌ **Stop if you see:**

- "Rate limit exceeded"
- Twitter verification request
- Account locked warning
- Unusual slow responses
- Multiple failed actions

**What to do:**

1. Stop extension immediately
2. Wait 24 hours
3. Restart with MORE conservative settings
4. Consider smaller batch sizes

---

## Multi-Language Support

Extension supports:

- 🇺🇸 English interface
- 🇮🇩 Indonesian interface (hapus, batalkan, etc.)

Works automatically based on your Twitter language setting!

---

## Risk Assessment

| Action        | Risk Level | Recommended Max/Day |
| ------------- | ---------- | ------------------- |
| Delete Posts  | 🔴 High    | 50-100              |
| Undo Retweets | 🟡 Medium  | 100-200             |
| Undo Likes    | 🟢 Low     | 200-500             |

---

**Remember:** Start conservative, monitor results, increase gradually. Better safe than banned! 🛡️
