# CodeStalk REST API

Base URL (dev): `http://localhost:4000`

Unless noted, JSON bodies use `Content-Type: application/json`.

## Auth header

Protected routes expect:

```http
Authorization: Bearer <jwt>
```

---

### `POST /auth/register`

Body:

| Field | Type |
|-------|------|
| `email` | string (email) |
| `password` | string (min 8) |
| `displayName` | optional string |

Returns `{ token, user }`.

---

### `POST /auth/login`

Body: `email`, `password`. Returns `{ token, user }`.

---

### `GET /auth/me`

Protected. Returns current user profile fields.

---

### `PATCH /auth/me`

Protected. Body (all optional):

| Field | Type |
|-------|------|
| `displayName` | string |
| `myLeetcodeUsername` | string or `""` to clear |
| `reminderEmailEnabled` | boolean |

---

### `GET /friends`

Protected. Returns enriched friends with LeetCode snapshots, badges, and nudge copy.

---

### `POST /friends`

Protected. Body:

| Field | Type |
|-------|------|
| `leetcodeUsername` | string |
| `nickname` | optional string |

Validates username exists on LeetCode via GraphQL.

---

### `DELETE /friends/:username`

Protected. Removes friend by LeetCode username.

---

### `GET /leetcode/:username`

Public (rate limited). Full snapshot: difficulty counts, streak, calendar heatmap, contest rating proxy, recent submissions summary.

---

### `GET /leaderboard?metric=…`

Protected. `metric`: `daily` \| `weekly` \| `monthly` \| `rating` \| `streak`. Ranked list of friends.

---

### `GET /contests`

Public (rate limited). Upcoming contests (`title`, `slug`, `startTime` unix sec, `durationSec`).

---

### `GET /compare?a=&b=`

Public (rate limited). Side-by-side stats for two LeetCode usernames.

---

### `GET /insights/weekly-summary`

Protected. Aggregates inactive-today friends and weekly volume leaders.

---

### `GET /dashboard`

Protected. Overview: optional self snapshot if `myLeetcodeUsername` set, friend pulse list.

---

### `GET /health`

`{ "ok": true, "service": "codestalk-api" }`
