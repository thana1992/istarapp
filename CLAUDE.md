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

#### 📄 Pagination + loading + fade — **MUST FOLLOW (every grid)**

Every data grid — `IdDataGrid.vue` (client-side) AND the server-side `.idt` tables (CustomerCourse / CustomerCourseFinished / Student) — shares ONE footer, ONE skeleton-loading behaviour, and ONE fade. All three pieces are centralized; never hand-roll them again. The three shared components are registered globally in `main.js`: `<id-pager>`, `<id-grid-footer>`, plus `IdDataGrid`.

1. **Footer = `<id-grid-footer>`** (`src/components/common/IdGridFooter.vue`). Renders the agreed layout: **`<id-pager>` (First « / Prev ‹ / numbered jump buttons `1 2 3 …` / Next › / Last »)** + an **items-per-page `<select>`** ("N ต่อหน้า") on the left, and the **range count** (`grid.range` → "X–Y จาก N รายการ") on the right. Props `page` / `pageCount` / `perPage` / `total` (+ optional `perPageOptions`, default `[10,20,50,100]`); emits `update:page` + `update:perPage`. It is presentational — the parent applies the change (and refetches, for server tables).
   - **`IdDataGrid`** uses it internally — page-size is a reactive `pp` (default `perPage` prop = 10); nothing for the page to do.
   - **Server tables**: `<id-grid-footer :page="tableOptions.page" :page-count="Math.max(1, Math.ceil(total / tableOptions.itemsPerPage))" :per-page="tableOptions.itemsPerPage" :total="total" @update:page="p => { tableOptions.page = p; refetch(); }" @update:per-page="n => { tableOptions.itemsPerPage = n; tableOptions.page = 1; refetch(); }" />`.
   - `<id-pager>` is also usable standalone (just the nav, no select/range). Pager/footer styling is global: `.grid-foot` / `.grid-foot-nav` / `.grid-pager` / `.pager-*` (incl. `.pager-num.is-active`, `.pager-gap`) / `.grid-pp*` in `istar-pages.css`.
2. **Loading = skeleton, NEVER the full-screen overlay or Vuetify's loading bar.** While a LIST fetch is in flight, show `.id-skel` rows in place of data — and keep the loading flag true for **≥1 second** so it never flashes (`$minLoad`, below).
   - `IdDataGrid` has a **`:loading` prop** → it renders skeleton `<tbody>` rows itself. Parents pass their existing flag (`:loading="loadingClasses"`) and **must stop emitting `$emit('onLoading', …)` for the list fetch** (that's the old full-screen overlay = the "wrong" loading). Keep `onLoading` only for mutations (save/delete) if desired.
   - **Page / per-page change must ALSO skeleton, on EVERY grid.** Server tables get this for free (changing page refetches → `loadingX`). `IdDataGrid` slices client-side (instant) so it has an internal `paging` flag: `goPage`/`setPerPage` flip `paging=true`, `await this.$minLoad(t0)`, then `paging=false` — the skeleton shows for the standard ≥1s and the new page fades in. A page change must never be a bare fade; it must read as a load.
   - Server tables render their own skeleton `<tbody v-if="loadingX">` (6 rows of `.id-skel`).
3. **Minimum 1s — ONLY for grid page/per-page changes (and explicit in-view data refetches), NOT for menu navigation.** The `$minLoad` delay exists so *changing the grid page* reads as a load. It must NOT be added to a view's menu-entry/initial fetch — navigating into a menu should be as fast as the real fetch (skeleton shows only while the request is in flight). Helper: `$minLoad(startedAt, ms=1000)` (on `app.config.globalProperties` in `main.js`) → `const t0 = Date.now(); …await fetch…; if (animate) await this.$minLoad(t0); this.loadingX = false;`.
   - Server tables: the fetch takes an `animate` flag — the footer's `@update:page`/`@update:per-page` pass `true` (→ ≥1s); menu-entry / search / post-mutation refresh pass nothing (→ skeleton only for the real fetch).
   - `IdDataGrid`: `runPaging()` (page/per-page) applies `$minLoad`; the parent's menu-entry fetch behind `:loading` does NOT.
   - In-view data refetches the user wants to *feel* (Reservation date change, Home member-select, BookingManagement roster date) keep `$minLoad` — they are not menu navigation.
   - Wire `$minLoad` into BOTH success (`.then`/`finally`) and `.catch`.
4. **Fade on swap** — the rows container (`<tbody>`, or any panel holding freshly-fetched data) gets `class="id-fade-in"` + a `:key` bound to what changed (`:key="page"` / `:key="tableOptions.page"` / `:key="studentid"` / `:key="classdate.getTime()"`). `.id-fade-in` lives once in `istar-design.css` (opacity+translateY, .28s, honours `prefers-reduced-motion`); re-keying re-triggers it so data eases in instead of popping ("แว๊บมา"). See [[istar-data-swap-smoothness]].

**Exceptions (intentionally NOT paginated):** the **ViewClasses timetable** (above) and the small **in-dialog "course-usage" `<v-data-table>` sub-tables** inside CustomerCourse / CustomerCourseFinished / Student — they are read-only show-all logs (`items-per-page` 100/1000), not list grids. Don't add pagination/skeleton to them.

#### 🔎 Grid filters — a single search box is not enough

Beyond the search box, each grid should expose the **filters that matter for that data**, rendered as themed `<id-select class="grid-filter">` (`.grid-filter` makes them auto-width in the toolbar).
- **Client-side grids (`IdDataGrid`):** pass a **`:filters`** array `[{ key, label, options:[{value,label}] }]` — IdDataGrid renders the `<id-select>`s and filters locally (exact `String(row[key])` match) + resets to page 1. Build `options` from the unique values of the loaded rows (e.g. Classes → `classday` + `coursename`; BookingManagement → `coursename` + `checkedin`).
- **Server-side tables (CustomerCourse / CustomerCourseFinished / Student):** add `<id-select class="grid-filter">`s bound to `filterX` data fields, send them as extra params in the fetch body, and `@update:model-value="applyFilter"` (`applyFilter` = `page=1; refetch()`). These are **server filters — the backend endpoint must read the new param** (e.g. `/getCustomerCourseList` must honour `coursetype` + `paid`; `/getFinishedCustomerCourseList` → `coursetype`). The frontend degrades gracefully (ignored param → no filtering) but isn't useful until the backend reads it.

#### 📊 Home quota meter = segmented pips, not a filling bar

A course quota *drains* (used up), so it must not read like a progress bar filling toward 100%. The Home cards use **`.quota-pips`** — one `.quota-pip` block per purchased session (`courseTotal`). The **used (faded) pips sit at the FRONT (left)** and the **remaining (filled, coloured `pipFill` red≤2/amber≤4/primary) sit at the BACK (right)**; fill condition is `i > courseTotal - remaining`, so as classes are used the coloured part recedes rightward. Monthly courses use **`.quota-bar`** — a continuous bar whose fill is anchored **right** (`justify-content:flex-end`, width = `monthlyPct`), draining the same direction as the pips.

### Dialog Standard — `IdModal` — **MUST FOLLOW**

**Every dialog is `<id-modal>`** (`src/components/common/IdModal.vue`, registered globally). Vuetify `<v-dialog>` is fully retired — there are none left in `src/components`. All dialogs (add/edit forms, delete/confirm, notify, image viewers, error/success) share one look: a **pink-gradient head** (icon + title + optional subtitle + × close), a scrollable **body slot**, and a right-aligned **footer slot**. ESC / scrim-click close (unless `persistent`); on mobile it docks to the bottom as a sheet. All styling is the global `.id-modal*` block in `istar-design.css`.

```html
<id-modal v-model="dialogX" size="lg" icon="mdi-account-plus" :title="formTitle" persistent>
  <div class="modal-sec"><span class="mdi mdi-…"></span> หัวข้อกลุ่ม</div>
  <div class="form-grid-3">
    <div class="field"><label>ชื่อ <span class="req">*</span></label><input class="id-input" v-model="form.name"></div>
    …
  </div>
  <template #footer>
    <button class="id-btn id-btn-ghost" @click="closeX">ยกเลิก</button>
    <button class="id-btn id-btn-primary" :disabled="!form.name" @click="save"><span class="mdi mdi-content-save"></span> บันทึก</button>
  </template>
</id-modal>
```

Rules:
- **Props:** `size` = `sm`(≤430) / `md`(≤560, default) / `lg`(≤760) / `xl`(≤980); `icon` (mdi class); `title` + optional `subtitle`; `persistent` for forms mid-edit (don't close on scrim/ESC); `noFooter` to drop the footer.
- **Footer buttons:** left `id-btn id-btn-ghost` (ยกเลิก) · right `id-btn id-btn-primary` (บันทึก). Destructive confirm uses `style="background:var(--c-error)"` on the primary. **Never** Vuetify `<v-btn color="blue/red">`.
- **Form fields are `.id-*`:** `<input class="id-input">`, `<textarea class="id-input id-textarea">`, switch = `.idsw` (`<span class="idsw" :class="{on:val}"><span class="track"/><span class="thumb"/></span>`), checkbox = `.id-check`, file/slip = `.id-upload` (native `<input type=file @change>`), avatar = `.dlg-avatar`. Section headers = `.modal-sec` (`.mt` on the 2nd+). Layout: `.form-grid` / `.form-grid-3` / `.form-grid-4`, `.field.full` for a full-row field, `.course-flow` for the course→next-course row.
- **Dropdowns = `<id-select>`, dates = `<id-date>`** (`IdSelect.vue` / `IdDateField.vue`, registered global) — NOT native `<select>` / `<input type=date>` (those fall back to the OS font + their popups get clipped by the dialog). Their popups teleport to `<body>` at **z-index 2600** (above the modal's 2500).
  - `<id-select v-model="x" :options="opts" placeholder="— เลือก —">` — `opts` is `[string]` or `[{value,label}]`. Add **`searchable`** (+ `search-placeholder`) for any API-backed list that can grow (students, parents/userid, course-refs, courses) — it becomes a type-to-filter combobox (this also restores the typeahead lost when v-autocomplete→select). Short fixed lists (gender/type/period) don't need it. A `@change` handler becomes `@update:model-value="handler"` (the handler reads `this.x`, already updated). For a select whose `:disabled`/readonly state matters, pass `:disabled`.
  - `<id-date v-model="x" placeholder="เลือกวันที่">` opens the **same `IdCalendar` as the Dashboard** as a popover (one date picker app-wide; replaced the old `@/components/DatePicker.vue`). It accepts the model as a `Date`, ISO, `YYYY-MM-DD`, or `YYYY-M-D` and **emits a zero-padded `YYYY-MM-DD`** (valid ISO → safe for `moment()`/`new Date()`). Optional `:mindate` (Date/string), `:disable-mondays`, `:holiday-keys`. A `@click`/`@update:modelValue` date handler becomes `@update:model-value="handler"`.
  - **`return-object` selects** (where the v-model is an OBJECT, e.g. a Vuetify `return-object` v-select): IdSelect compares options by `String(value)` (objects all collapse to `"[object Object]"`), so DON'T bind the object directly. Instead bind by a primitive id and map back in the handler — the save logic still reads the object, untouched:
    ```html
    <id-select :model-value="form.course ? form.course.courseid : ''"
      :options="courseLookup.map(c => ({ value: c.courseid, label: c.coursename }))"
      @update:model-value="id => form.course = courseLookup.find(c => c.courseid === id)"></id-select>
    ```
    Used for CustomerCourse `course` and BookingManagement `classtime`. (There are NO native `<select>` left in dialogs.)
  - Global rule `input, select, textarea { font-family: var(--font-body) }` forces the theme font onto any remaining native control.
- **Validation = `:disabled` on the save button**, not Vuetify `:rules`. When a method still calls `this.$refs.someForm.validate()`, KEEP the `<v-form ref="…">` wrapper around the body — a v-form with plain `.id-*` inputs validates to `{valid:true}`, so the existing save logic is untouched and the `:disabled` guard enforces required fields.
- **No horizontal overflow** — long content wraps; `.id-modal-body` scrolls vertically only (built into the CSS: `overflow-x:hidden` + `overflow-wrap:break-word`).
- **`z-index: 2500`** on `.id-modal-scrim` so it sits above the Vuetify app bar (1100) and any teleported overlay.
- **Kept-as-is inside IdModal** (don't force into `.id-*`): the read-only course-usage `<v-data-table>` sub-tables (wrap them in `.id-modal-grid > .id-modal-grid-scroll`). (The old `DatePicker` is fully retired — use `<id-date>`.)

See [[istar-idmodal-dialogs]].

### Theme System

The whole app is driven by **design tokens** in `:root` (`src/assets/istar-design.css`): `--c-*` colours, `--c-bg-grad`, `--sidebar-*`, `--topbar-*`, `--shadow-*`, `--font-*`. The base look (the iStar pink "Default" theme) lives in `:root`. **Seasonal themes re-paint those tokens** under an `html.theme-*` class in `src/assets/istar-themes.css` (specificity `0,1,1` beats `:root` `0,1,0`, so toggling the class swaps the palette instantly).

| Theme | id (`uiTheme`) | CSS class | Overlay component |
|-------|----------------|-----------|-------------------|
| Default (iStar pink) | `default` | (none → `:root`) | — |
| วันแม่ (Mother's Day) | `mothersday` | `theme-mothersday` | `theme/MothersDayOverlay.vue` |
| ลอยกระทง (Loy Krathong) | `loykrathong` | `theme-loykrathong` | `theme/LoyKrathongOverlay.vue` |

- **Scope: system-wide, head-controlled.** Only head/admin (`usertype 0/1`) see the picker (topbar palette button, `App.vue`). The chosen theme is saved globally via backend `POST /saveAppSettings` and read by everyone via `POST /getAppSettings` (`App.vue` `saveGlobalTheme`/`fetchGlobalTheme`); `localStorage['uiTheme']` is only a cache for instant/offline/login-screen paint. (Backend contract: `docs/app-settings-api-spec.md`.)
- `App.vue` `applyUITheme(theme)` toggles the `html.theme-*` class; the always-on legacy `theme-playful` class only defines `--pf-*` and never competes.

#### 🎏 Adding a new seasonal theme — **STANDARD**

1. **Tokens** — add an `html.theme-<id> { … }` block in `src/assets/istar-themes.css`. Override **paint tokens only** (brand/surface/text/shadow + `--sidebar-*`/`--topbar-*`). Keep radius, spacing, fonts, and the functional status/roster colours (`--c-success/warning/error/info`, `--c-trial`, `--c-session`) identical so the booking grid reads the same. **Surfaces stay light** — page headings render directly on `--c-bg-grad`, so a dark page bg breaks text contrast; put any "night" mood in the sidebar gradient + the overlay, not the page bg.
2. **Picker** — add an entry to `themeOptions` in `App.vue` (id/name/sub/swatch) + `theme.<id>` / `theme.<id>Sub` keys in `src/i18n.js`, and a branch in `applyUITheme`. Add the id to the backend `/saveAppSettings` whitelist.
3. **Overlay (optional but expected)** — a component in `src/components/theme/`. **Performance budget:** `transform`/`opacity` animations only; no animated `filter`/`background-position`/`mask`; no `will-change`; modest element counts; shared SVG `<defs>` with **per-instance namespaced ids** (a `uid` in `data()`) — duplicate gradient ids across two instances make fills vanish when one instance is `display:none`. Always honour `prefers-reduced-motion`.
4. **Render the overlay in TWO places:**
   - **App shell** — inside `App.vue`'s `.main` (`v-if="uiTheme==='<id>'"`). `.main` is a stacking context (`position:relative; z-index:0`); the overlay is `position:absolute; inset:0; z-index:-1; pointer-events:none` so it paints above the gradient, below page content.
   - **Login screen (REQUIRED)** — **every theme must preview on the login hero.** `App.vue` passes `:ui-theme="uiTheme"` to `<Login>`; `Login.vue` renders the overlay inside `.lg-hero` (desktop canvas) AND inside `.lg-form` with class `lg-ov-m` (mobile-only; the hero is `display:none` ≤900px). Login pins them with `.lg-ov { position:absolute!important; inset:0!important; z-index:0!important }` (the global `.lg-hero > *:not(.lg-spark)` rule would otherwise force them to z-index:1) → they sit at the sparkle layer, above the gradient, below the content. Do NOT render the login overlay at App level — `.lg-wrap` is `position:fixed; z-index:1` and covers it.

Overlays use `pointer-events: none`. See the Layout Consistency Rule below — theme switching is **paint-only**.

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


### UI Change

มีการปรับ UI ของระบบ จากเดิม เพื่อปรับปรุงหน้าตาของระบบใหม่ โดยไม่กระทบการทำงานหลังบ้าน โดยมีรายละเอียดของ design ใหม่ อยู่ที่ folder vue-newdesign 