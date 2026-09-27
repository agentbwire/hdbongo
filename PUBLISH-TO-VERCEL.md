# Publishing hdbongo to Vercel

This build keeps your stack: plain HTML, CSS and JavaScript, no React, no
TypeScript. Firebase is used for accounts and data (Firestore), Vercel serves the
site and runs three small payment files for mobile money.

## What is in this package

```
index.html                 the site
app.js                     page logic (accounts, packages, playback, hover previews)
config.js                  your Firebase web config (already filled in)
lib/firebase.js            connects the page to Firebase                       (new)
lib/store.js               the single account store — reads/writes the account   (new)
styles/card-preview.css    the hover panel styles                               (new)
service-worker.js          offline cache, updated so new deploys appear at once
api/payments/initiate.js   starts a mobile money payment                        (new)
api/payments/webhook.js    receives Mongike's confirmation                      (new)
api/payments/status.js     answers "has it been paid yet?"                      (new)
api/_lib/                  shared helpers for those three files                 (new)
firestore.rules            security rules for your database (paste into Firebase)(new)
vercel.json, package.json  Vercel settings
.env.example               the settings to add in Vercel
data/ , assets/            your titles, categories, logos — unchanged
```

There is no build step: what you see is what is served.

---

## Step 1 — Firebase console

1. **Firestore Database** → create the database if it does not exist yet (pick a
   region near Tanzania, e.g. `europe-west1`, and start in **production mode**).
2. Open the **Rules** tab, replace what is there with the whole of
   `firestore.rules`, and press **Publish**.
   Your current rule (`allow read, write: if false`) locks everything, including
   the site itself. The new file opens exactly one door: a signed-in user's own
   account, and only their own.
3. **Authentication** → **Sign-in method** → make sure **Email/Password** is on.
4. **Authentication** → **Settings** → **Authorized domains** → **Add domain**, and
   add the Vercel address from step 2 (for example `hdbongo.vercel.app`). Without
   it, signing in on the live site fails with `auth/unauthorized-domain`.
5. Leave the email templates alone: verification and password-reset mails keep
   working exactly as before.

## Step 2 — Put the site on Vercel

Install the command line once, then deploy from inside this folder:

```bash
npm i -g vercel
cd hdbongo
vercel          # first deploy — answers a few questions
vercel --prod   # the live address
```

On the first run Vercel asks about framework and build settings. Answer:

- Framework preset: **Other**
- Build command: leave empty
- Output directory: leave empty (your page is at the top level of the folder)
- Development command: leave empty

`vercel.json` already sets the framework to none and tells Vercel where the
payment files live. **Do not set an output directory of `src`** — your pages are
not in a `src` folder, so that setting 404s the whole site.

Prefer GitHub? Push this folder to a repository and import it at vercel.com; the
same settings are read from `vercel.json`.

## Step 3 — Environment variables

Vercel → your project → **Settings** → **Environment Variables**. Add these three
(All Environments), then redeploy:

| Name | Value |
|------|-------|
| `MONGIKE_API_KEY` | your live key from the Mongike dashboard (starts with `mk_live_`) |
| `SITE_URL` | your live address, e.g. `https://hdbongo.vercel.app` |
| `FIREBASE_SERVICE_ACCOUNT` | the whole JSON file from Firebase → Project settings → **Service accounts** → **Generate new private key** |

Instead of the JSON blob you may use three separate values, which is handy if a
host dislikes long one-line values:

| Name | Value |
|------|-------|
| `FIREBASE_PROJECT_ID` | `hdbongoclub` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@hdbongoclub.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | the `private_key` value from that JSON, quotes included |

`MONGIKE_API_KEY` and the service account are secrets: they belong in Vercel only.
Never put them in `config.js`, and never send them in a chat message.

## Step 4 — Mongike

Nothing to configure for the confirmation address: the site builds it from
`SITE_URL` on every payment, so it always points at your live site. Mongike sends
your key back in the `x-api-key` header when it calls, which is how the site proves
a confirmation is genuine.

## Step 5 — Test with one small real payment

1. Open the live address (never a preview address — Mongike only confirms to the
   address in `SITE_URL`), register a normal account, open **Vifurushi**, pick
   **Wiki**, choose a network, and pay with your own phone.
2. Approve the PIN prompt. The page keeps checking for up to two minutes, then
   switches the package on and shows the confirmation.
3. Cost: Wiki is TZS 2,000 and Mwezi is TZS 5,000. The package cut comes out of
   your side (`fee_payer: MERCHANT`).
4. Watch the run: Vercel → your project → **Logs** / **Functions** shows the three
   payment files' output, and Mongike's dashboard shows the transaction.

### What you should see after paying

- The account's package becomes **Wiki** or **Mwezi**, with an expiry under
  **Profile → Muda**.
- It survives signing out, signing back in, closing the browser and switching
  device — the account lives in Firestore, not in the browser.
- Firestore → **users** → one document per account; **payments** → one receipt per
  purchase.

## About accounts, passwords and signing in

**Jisajili (sign up) and Ingia (sign in) are handled by Firebase Authentication**,
against your own `hdbongoclub` project. The page does not keep its own user list and
does not check anything itself.

- Sign up calls Firebase's `createUserWithEmailAndPassword`, saves the display name,
  and sends the confirmation email.
- Sign in calls Firebase's `signInWithEmailAndPassword`.
- "Forgot password" calls Firebase's `sendPasswordResetEmail`.

**Where things are stored**

| What | Where | Notes |
|------|-------|-------|
| Password | Firebase Authentication | Salted and hashed. Nobody can read it — not you in the console, not this site, not the database. |
| Email | Firebase Authentication **and** `users/{uid}` in Firestore | The account document carries it so the profile page and receipts can show it. |
| Name | Firebase Authentication (display name) **and** `users/{uid}` | Editable by its owner. |
| Plan, points, purchases, watch list, receipts | `users/{uid}` and `payments/{id}` in Firestore | Written by the site and by the payment confirmation. |

**There is deliberately no password field in Firestore.** Putting one there would mean
storing it in plain text in a place that shows up in database exports, backups and the
console; Firestore rules could not protect it, because the rule would have to let the
account's owner write it. It would also break password reset and email confirmation,
which rely on Firebase Authentication holding the credential. The rules enforce this
from the other side: a sign-up may only create a document carrying the signed-in user's
own email, and that email can never be swapped for somebody else's.

**Signing up gives access immediately.** This is Firebase's default and is how this
site is set up on purpose: the account is created and signed in at once, and the
confirmation email arrives as information rather than as a gate. Before you go live,
add your live address at **Authentication → Settings → Authorized domains**, otherwise
sign-up fails on the deployed site with `auth/unauthorized-domain` (it works on
localhost because Firebase trusts localhost by default).

If you later decide people must confirm their email *before* using the site, that is a
small change in `app.js` — the sign-up and sign-in functions would check
`user.emailVerified` and show a "confirm your email first" message when it is false.
Ask and it can be added.

### Removing a test account

Deleting it needs both halves, in this order:

1. **Firebase console → Authentication → Users** → find the email → **⋮** on its row →
   **Delete account**. This removes the login itself; the address can then be used again.
2. **Firebase console → Firestore Database → Data** → `users` → the document whose id
   matches that account (the list shows the `email` field, so you can find it) → **Delete
   document**. This is the leftover profile; a fresh sign-up with the same address gets a
   new id and would otherwise leave this orphan behind.

Deleting only the Authentication entry leaves the profile document behind, and deleting
only the document leaves a login that still works.

## Troubleshooting

| What you see | What it means |
|--------------|---------------|
| `auth/unauthorized-domain` when signing in | Add the Vercel domain in Firebase → Authentication → Settings → Authorized domains |
| "Nambari ya simu si sahihi" | Type the local form, e.g. `0741234567` — the site converts it |
| Still pending after two minutes but money left the phone | Compare `SITE_URL` with your live address (they must match exactly), then check the function logs for the webhook call |
| `Missing or insufficient permissions` in the browser console | The rules were not published, or belong to a different project |
| The old page keeps showing after a deploy | Hard-refresh once; the cache name was bumped so this happens once only |
| `Firebase server credentials missing` in the logs | `FIREBASE_SERVICE_ACCOUNT` (or the three separate values) is missing, or was added after the last deploy — redeploy |

## Changing prices

Prices and package lengths live in `api/_lib/packages.js` and are only ever read on
the server, so a price cannot be edited from the browser. Change them there,
deploy, and the checkout shows the new amount automatically.

## Two small notes

- Cards are gone from the checkout on purpose: this site collects with Mongike's
  mobile money.
- `manifest.json` was never inside the archive, so the service worker no longer
  tries to cache it. Nothing else about the offline behaviour changed.
- The page's own offline/online script had `document.getElementById(...)?.style.display
  = 'flex'`, which is invalid JavaScript and stopped that whole block from running (so
  the service worker never registered). It is fixed in this package.
