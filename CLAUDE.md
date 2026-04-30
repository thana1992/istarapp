# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + Vuetify 3 SPA for gymnastics class management (iStar). UI is in Thai, code is in English. No TypeScript — plain JavaScript ES6+.

## Commands

```bash
npm run serve    # Dev server with hot-reload + backend proxy
npm run build    # Production build → dist/
npm run lint     # ESLint check
```

Node version required: **20.10.0** (specified in `package.json` engines).

Backend URL is set via `env.SERVER_URL` in `.env`. Dev proxy is configured in `vue.config.js`. Accessible globally in components as `this.baseURL`.

There is no test suite.

## Architecture

### View Navigation — No Vue Router for views

Views are not routed via Vue Router. Instead, `App.vue` holds a `state` string and renders components with `v-if="state == 'home'"`. To navigate, child components emit:

```javascript
this.$emit('onClickChangeState', 'newstate')
```

Common states: `login`, `register`, `home`, `dashboard`, `familylist`, `reservation`, `bookingmanager`, `courses`, `classes`, `studentmanager`, `holidaymanager`, etc.

### Role-Based Access Control

User role is stored in `userdata.usertype` (both Vuex + localStorage):
- `0` = head (manager) — full access including Dashboard
- `1` = admin — Dashboard + management features
- `2` = coach — view classes only
- `3+` = customer — Home, family, reservation

After login, `App.vue`'s `AffterLogin()` sets boolean flags: `managerflag`, `adminflag`, `coachflag`, `customerflag` — these control which UI elements are shown.

### Event-Driven Communication

Parent-child communication uses custom events (no event bus):

```javascript
// From any child component:
this.$emit('onLoading', true)           // Show/hide loading overlay
this.$emit('onErrorHandler', 'msg')     // Show red error dialog
this.$emit('onSuccessHandler', 'msg')   // Show green success dialog
this.$emit('onInfoHandler', 'msg')      // Show info dialog
this.$emit('initBack', callback)        // Enable back button
this.$emit('collectData', data)         // Pass data up to App.vue
```

All dialogs and the loading overlay are centralized in `App.vue`.

### API Calls

```javascript
axios.get(this.baseURL + '/endpoint', {
  headers: { Authorization: 'Bearer ' + this.$store.getters.getToken }
})
```

- Every component verifies the token in its `created()` hook by calling `/verifyToken`
- Passwords are SHA256-hashed on the frontend via CryptoJS before sending
- Vuex store is minimal: only `setToken`, `getToken`, `isLoggedIn`

### Data Tables — Color Coding

Booking tables use inline color markers in cell text: `(red)`, `(green)`, `(blue)`, `(yellow)`, `(pink)` — these are stripped before rendering and used to apply background colors. `(1)` adds the `highlighted-blackground` class. See `BookingList.vue` for the template slot pattern.

### Seasonal Theme System

Themes activate automatically based on the current month. State lives in `App.vue`:

| Theme | Months | CSS class | Overlay component |
|-------|--------|-----------|-------------------|
| Halloween | October (10) | `theme-halloween` | `HalloweenOverlay.vue` |
| Christmas | November–December (11–12) | `theme-christmas` | `ChristmasOverlay.vue` |

Stored in localStorage as `currentTheme` (`'none'` / `'halloween'` / `'christmas'`). Only one theme active at a time. Music toggle is in `App.vue` (not in the overlay component). Overlays use `pointer-events: none` so they don't block clicks.

**Z-index hierarchy** (highest to lowest):
- `2400` — Vuetify dialogs (must be above app bar + drawer)
- `2000` — Dialog backdrop
- `1100` — App bar (frosted glass, always on top)
- `1000` — Navigation drawer (full-height panel; sits behind app bar)
- `999`  — Drawer scrim
- `50`   — Santa sleigh (Christmas)
- `10`   — Cards/tables
- `5`    — Christmas overlay background
- `1`    — Main content

The app bar uses `backdrop-filter: blur()` + `rgba(var(--v-theme-surface), 0.82)` for a frosted glass effect — do not re-add `opacity` to `.v-app-bar` (it makes the whole bar including text translucent and lets body content bleed through).

The drawer panel itself is full-height (Vuetify's default) and sits *behind* the app bar — but `.v-navigation-drawer__content` has `padding-top: 64px` so the first item (avatar) renders below the app bar instead of being hidden. Don't try to offset `.v-navigation-drawer { top: 64px }` directly; Vuetify's inline positioning fights it and the avatar item ends up clipped.

### Date Formatting

Use Thai Buddhist calendar:
```javascript
date.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
```

Moment.js is available for date manipulation.

### Component Conventions

- Import in PascalCase: `import BookingManagement from './components/admin/BookingManagement.vue'`
- Use in templates as kebab-case: `<booking-management />`
- Dark theme is the default (set in `main.js`)
- Use `card-opacity` CSS class for semi-transparent card backgrounds
- Use `<v-skeleton-loader>` for table loading states
