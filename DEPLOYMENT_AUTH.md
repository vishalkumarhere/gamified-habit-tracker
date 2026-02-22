# Fixing Google Auth After Deploying to Vercel

If Google sign-in works locally but fails in production, follow these steps.

## 1. (Optional) Add `NEXT_PUBLIC_APP_URL` in Vercel

The callback uses the request's origin by default, so this is **optional**. Only add if you see redirect issues in production.

If needed, in **Vercel Dashboard → Project → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

**Do not** add this to `.env.local`—it would make local sign-in redirect to your Vercel app instead of localhost.

---

## 2. Configure Supabase Redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| **Site URL** | `https://your-app.vercel.app` |
| **Redirect URLs** | Add: `https://your-app.vercel.app/**` |

---

## 3. Configure Google Cloud Console

In **Google Cloud Console → APIs & Services → Credentials** (your OAuth 2.0 Client):

**Authorized JavaScript origins**
- `https://your-app.vercel.app`
- `https://YOUR_PROJECT_REF.supabase.co` (from your Supabase URL)

**Authorized redirect URIs**
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Use the project ref from `NEXT_PUBLIC_SUPABASE_URL` (e.g. `hnkdvdsxlzgoyjyyekss`).

---

## 4. Quick checklist

- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel
- [ ] Supabase Site URL = production URL
- [ ] Supabase Redirect URLs include `https://your-app.vercel.app/**`
- [ ] Google: Vercel URL in Authorized origins
- [ ] Google: Supabase callback in Authorized redirect URIs
- [ ] Redeploy after env var changes
