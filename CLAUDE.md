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

### Data Grid Standard — **MUST FOLLOW**

Every data grid must look and behave identically. Two implementations exist and **both follow the same rules**:
- **`.idt` tables** — the standard grid (`<table class="idt">` or the `IdDataGrid.vue` component). Used by most admin lists (Gymnast List, Customer Courses, Course History, Classes, Courses).
- **Vuetify `<v-data-table>`** — used by Booking Management and a few in-dialog sub-tables.

Shared rules, defined **once** in `src/assets/istar-pages.css` under the "SYSTEM GRID STANDARD" comment block:

1. **Single line + horizontal scroll, at ALL screen sizes.** Cells are `white-space: nowrap`; the wrapper (`.scard > div` or `.v-table__wrapper`) has `overflow-x: auto`. Data is **never** wrapped to a new line and **never** truncated with `…` / `text-overflow: ellipsis`. (The old `@media (min-width:1280px)` rule that switched `.idt` to `table-layout: fixed` + ellipsis on wide screens was removed — it hid data. Mobile already scrolled; now every width does.)
2. **Headers bold, data normal weight.** `.idt th` is `font-weight:700`; `.idt td` is normal. Do **not** wrap individual data cells in `<b>`/`<strong>` to emphasize one column — that is exactly what made `fullname` / `courserefer` inconsistently bold across grids. Identifier/reference cells use the `.id-copy` helper (plain text + a `.id-copy-btn` copy icon), not bold.
3. **Action columns** (`edit`/`delete`/`finish`/`view`/`actions`…) get the `idt-action` class — narrow (64px), centered, pinned right.

**Exception:** the **ViewClasses timetable** (`ตารางเรียน`) is intentionally custom — it uses neither `.idt` nor `v-data-table` and is exempt. Do not "normalize" it.

Before changing grid styling, follow the **Stylesheet Modification Protocol** below (grep for duplicate/competing selectors across `istar-pages.css`, `global-style.css`, and component `<style scoped>`).

### Dialog Standard — **MUST FOLLOW**

Every view / add / edit dialog (`<v-dialog>`) must fit the viewport **horizontally** at all sizes:
- **No horizontal overflow, no horizontal scrollbar.** Long content wraps; the dialog scrolls **vertically** only (a vertical scrollbar is acceptable).
- Enforced globally in `src/assets/istar-pages.css` ("SYSTEM DIALOG STANDARD"): `.v-dialog .v-card / .v-card-text { overflow-x: hidden }` + `overflow-wrap: break-word` + `img/.v-img { max-width:100% }`.
- **Responsive columns are part of the standard:** inside dialog forms, every `<v-col>` must be `cols="12"` on extra-small screens (only narrow to `sm`/`md` on larger breakpoints). A sub-12 xs value like `cols="6"` / `cols="3"` squeezes a field/label into a sliver on mobile and its text wraps one character per line — never set a sub-12 `cols` (the xs value).

### Theme System

User-selectable themes via picker in navigation drawer (saved to localStorage + backend `/saveAppSettings`). Halloween/Christmas also have animated overlay components.

| Theme | CSS class | Overlay |
|-------|-----------|---------|
| Neumorphic (default) | (none) | — |
| Playful | `theme-playful` | — |
| Halloween | `theme-halloween` | `HalloweenOverlay.vue` |
| Christmas | `theme-christmas` | `ChristmasOverlay.vue` |
| iStar Gymnastics | `theme-istar` | — |

Stored in localStorage as `uiTheme`. Token-based CSS variables: Playful uses `--pf-*`, iStar `--is-*` — change palette in one place, all rules cascade. Music toggle (Christmas) lives in `App.vue`. Overlays use `pointer-events: none`.

#### 🔒 Layout Consistency Rule — **MUST FOLLOW**

**Card / Table / Toolbar dimensions (width, height, padding) MUST stay identical across all themes.** Themes change colors, gradients, shadows, typography, and decorations — they NEVER change layout dimensions.

**Why**: Switching themes should be a paint-only operation. A user toggling themes should see colors change, never see content reflow, cards resize, or tables shift. The baseline Neumorphic geometry is authoritative.

**How to add theme decorations correctly**:
- ✅ **DO** use absolute-positioned overlays (e.g., `.stat-card::before { position: absolute; ... }`) — overlays sit on top of content without affecting flow
- ✅ **DO** use background images, gradients, shadows, borders — paint-only changes
- ✅ **DO** use CSS pseudo-elements (`::before` / `::after`) with `position: absolute`
- ❌ **DO NOT** add `padding-top: 22px !important` (or similar) on cards "to make room" for decorations — this changes the card height per-theme
- ❌ **DO NOT** insert flow-positioned `<div>` decorations that take vertical space
- ❌ **DO NOT** change `height=""` attribute on `v-card` per-theme

**Decoration patterns that respect this rule**:
- Corner watermarks: `position: absolute; bottom: -8px; right: -4px; opacity: 0.2;`
- Overlay banners at card top: `position: absolute; top: 4px; left: 0; right: 0;`
- Diagonal ribbons in corners: `position: absolute; transform: rotate(45deg);`

**If a decoration needs flow space** (rare): increase the BASELINE card height across all themes, not just the theme that needs space. Better: redesign the decoration as an overlay.

#### 🔍 Stylesheet Modification Protocol — **MUST FOLLOW**

When editing any CSS file (`global-style.css`, `<style>` block in `.vue`), the same change has bitten us multiple times because we skipped these checks. Do them every time — no exceptions.

**Before editing a CSS rule, run these 4 checks:**

1. **Hunt for duplicate selectors** in the SAME file. CSS is order-dependent: when two rules have the same selector and specificity, the LATER one wins. Editing the first occurrence is invisible because a later duplicate overrides it.
   - Use `Grep` with the full selector (e.g., `html.theme-playful .qa-btn`) across the file. If more than one match, consolidate before editing.

2. **Find competing selectors across files** — the same class can be styled in `global-style.css`, a Vue component's `<style scoped>`, AND theme-specific blocks. Vue scoped styles compile to `.foo[data-v-xxxx]` (specificity boost via attribute). A global `html.theme-X .foo` (specificity 0,2,1) usually wins over scoped `.foo[data-v-xxxx]` (0,2,0), but `!important` and load order can flip it. Always grep across the whole `src/` tree.

3. **Cross-theme impact check** — for every theme palette change, verify the selector isn't shared with: Neumorphic (base), Playful, Halloween, Christmas, iStar, Dark mode (`.v-theme--dark`). Use `Grep` for the selector or class name across the codebase. A change scoped with `html.theme-playful` only affects Playful, but a change to a base class (e.g. `.qa-btn` without theme prefix) affects everything.

4. **Verify the rule will actually apply** — trace specificity and source order:
   - Scoped styles in `.vue` files get a `[data-v-hash]` attribute selector appended to the LAST simple selector, bumping specificity by one attribute.
   - Global rules with `html.theme-X` prefix typically win over scoped base rules.
   - `!important` only matters when same-importance rules tie on specificity.
   - When rules tie on specificity, the LATER one in source order wins — but components scoped CSS loads at component-mount time, which can be after global CSS.

**Honesty about testing:** I cannot run the dev server and visually verify rendering. After editing CSS, I can only verify via cascade tracing (greps, specificity math). If a fix needs visual confirmation, say so explicitly — don't claim "done" without that confirmation.

**Notes on lessons learned** live in the auto-memory system at `C:\Users\thana\.claude\projects\c--iStarApp-istarapp-dev\memory\`. Before any CSS/layout fix, check `MEMORY.md` for prior incidents with similar selectors or symptoms.

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


