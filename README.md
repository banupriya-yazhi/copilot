# copilot

A two-page static demo: a sign-in page and a dashboard behind it.

No build step, no dependencies, no backend. Plain HTML, CSS, and JavaScript that
can be served from any static host.

## Running it

Anything that serves static files will do:

```bash
npx serve .
```

Then open the printed URL. Opening `index.html` directly from the filesystem
works too, though some browsers restrict `localStorage` on `file://` URLs, which
the session relies on.

## The pages

**`index.html` — sign in.** Email and password fields with client-side
validation (email format, 8-character minimum), a show/hide password toggle, and
a "Remember me" checkbox. On success it redirects to the dashboard.

**`dashboard.html` — the dashboard.** Four stat tiles, a 12-month revenue chart,
and a recent-activity table. Includes a light/dark toggle and a sign-out button.
Redirects back to the login page if there's no session.

## There is no authentication here

The sign-in accepts **any** correctly-formatted input — there is nothing to
check it against. The gate on the dashboard reads a marker in browser storage
that anyone can set from the console in two seconds.

It exists so the two pages hang together as a demo. It is not a security
boundary, and it will not become one by being moved or renamed. Real enforcement
belongs on a server, at which point `session.js` is what gets replaced.

## Files

| File | |
|---|---|
| `index.html`, `styles.css`, `script.js` | the login page |
| `dashboard.html`, `dashboard.css`, `app.js` | the dashboard |
| `data.js` | the dashboard's sample data |
| `session.js` | the demo session, shared by both pages |

Both stylesheets define `.card` with conflicting rules, which is why they are
separate files rather than one shared stylesheet.

## Changing the data

The dashboard reads `window.DASHBOARD_DATA`, set in `data.js`. Replace that file
with a real API call producing the same shape and nothing else needs to change —
`app.js` doesn't care where the object came from.

The chart is hand-drawn inline SVG in `app.js` rather than a charting library.
It plots a single series from `revenueByMonth` and scales to whatever values it
is given.

## Notes

- **Themes** are two designed sets of colors, not an inverted filter. The toggle
  persists per browser and defaults to the OS setting.
- **The chart** labels only the first, last, and peak months; hover or keyboard
  focus reveals the rest.
- **"Remember me"** picks where the session is kept: `localStorage` when
  checked, `sessionStorage` otherwise.
- **The gate** runs in `<head>` before the body renders, so no dashboard content
  flashes before the redirect.
