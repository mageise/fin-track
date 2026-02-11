# FinTrack UI/UX Guidelines

Guidelines for consistent UI/UX across FinTrack features.

## Page Structure

### Container
- Background: `bg-gray-50`
- Padding: `p-6`
- Max width: `max-w-7xl mx-auto`
- Minimum height: `min-h-screen`

### Header Pattern
- Back link: ArrowLeft icon with theme-colored hover state
- Page icon: `w-10 h-10` with theme color
- Title: `text-4xl font-bold text-gray-800`
- Subtitle: `text-gray-600`

### Theme Colors
Each tool/page uses a unique theme color. Already taken:
- Dashboard: blue
- Budget: emerald
- Investment Portfolio: purple
- Savings: orange
- Performance: amber
- FIRE Calculator: cyan
- Mini Games: pink
- Settings: rose

**New tools must pick a unique color not already used.**

## Components

### Summary Cards
- 4-column grid: `grid-cols-1 md:grid-cols-4 gap-6 mb-8`
- Icon container: `p-3 bg-{color}-100 rounded-lg`
- Icon size: `w-6 h-6 text-{color}-600`
- Label: `text-sm text-gray-600`
- Value: `text-2xl font-bold text-{color}-600`

### Card Component
- Default: White background, rounded corners, shadow
- With title: Header with border separator
- Padding: `p-6` (content), `px-6 py-4` (title)

### Modals
- Standard: `max-w-2xl`
- Complex forms: `max-w-3xl`
- Delete confirmation: `max-w-md`
- Overlay: `bg-black bg-opacity-50 z-50`

### Tables
- Header: `bg-gray-50 border-b border-gray-200`
- Row hover: `hover:bg-gray-50`
- Text alignment: Left (text), Right (numbers), Center (actions)
- Sort icons: ArrowUpDown, ChevronUp, ChevronDown

### Progress Bars
- Container: `w-full bg-gray-200 rounded-full h-2`
- Fill: `h-full rounded-full`
- Colors by percentage:
  - <75%: `bg-green-500`
  - 75-100%: `bg-yellow-500`
  - >100%: `bg-red-500`

## Color Usage

### Consistent Pairs
Use 100/600 color combinations:
- Background: `bg-{color}-100`
- Text/icon: `text-{color}-600`

### Semantic Colors
- Success/completed: Green (100/600)
- Error/alert: Red (100/600)
- Warning: Amber/Yellow (100/600)
- Neutral: Gray (100/600)

### Dynamic Values
- Positive: `bg-green-100` + `text-green-600`
- Negative: `bg-red-100` + `text-red-600`
- Use TrendingUp/TrendingDown icons accordingly

## Actions

### Buttons
- Primary: `bg-{theme}-600 text-white px-4 py-2 rounded-md hover:bg-{theme}-700`
- With icon: Plus or SquarePlus icon + text
- Icon-only: `p-1 text-gray-600 hover:text-{theme}-600 transition-colors`
- Delete: `hover:text-red-600`

### Inline Edit
- Input: Border-bottom style, transparent background, autoFocus
- Save: On blur or Enter key
- Click to edit: Cursor pointer

## States

### Empty State
- Centered: `text-center py-12 text-gray-500`
- Icon: `w-16 h-16 mx-auto mb-4 text-gray-300`
- Message: `text-lg font-medium`

### Status Messages
- Success: `bg-green-50 border-green-200 text-green-700`
- Error: `bg-red-50 border-red-200 text-red-700`
- Warning: `bg-amber-50 border-amber-200 text-amber-700`

### Loading
- Spinner: `Loader2` icon with `animate-spin`
- Disabled state: `opacity-50 cursor-not-allowed`

## Icons

### Sizes
- Cards: `w-6 h-6`
- Actions: `w-4 h-4`
- Empty states: `w-16 h-16`
- Header: `w-10 h-10`

### Source
Use Lucide React icons only.

## Spacing & Typography

### Spacing
- Grid gaps: `gap-6`
- Section margins: `mb-8`
- Card padding: `p-6`

### Typography
- Headings: `text-gray-800`
- Body/labels: `text-gray-600`
- Use existing font stack (system fonts)

## Responsive Design

### Breakpoints
- Mobile: Default (1 column)
- Tablet: `md:` (2 columns)
- Desktop: `lg:` (3+ columns)

### Patterns
- Summary cards: 1 col → 4 cols
- Content grids: 1 col → 2 cols → 3 cols
- Tables: Horizontal scroll on mobile

## Translation

All user-facing text must be translatable:
- Use `t('translationKey')` from useTranslation hook
- Add keys to `src/i18n/translations.ts` (both DE and EN)
- Follow existing naming conventions

## New Feature Checklist

When implementing a new feature:

- [ ] Page container follows standard structure
- [ ] Header with back link and theme-colored icon
- [ ] 4 summary cards with consistent styling
- [ ] Unique theme color (not already used)
- [ ] Primary action button with Plus icon
- [ ] Modal follows size standards
- [ ] Empty state with gray icon
- [ ] All text is translatable
- [ ] Responsive design tested
- [ ] Follows color usage guidelines

---

**Last updated:** February 2025
