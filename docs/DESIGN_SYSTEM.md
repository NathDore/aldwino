# Design System

This document defines the visual design principles and color palette for the aldwino application. Use this as a reference when implementing new features.

## Design Philosophy

**Minimalist approach** — Clean, simple, lots of whitespace. Focus on content with restrained visual elements. No unnecessary flourishes.

### Key Principles
- Subtle borders and restrained use of color (except for feature-specific color swatches)
- Generous whitespace for breathing room and clarity
- Clear visual hierarchy through size and contrast
- Consistent, reusable button components for all interactive elements
- Light theme for better readability and modern aesthetic
- Proportionate spacing that scales with content density

---

## Color Palette

All colors use Tailwind CSS utility classes from the light theme palette.

### Backgrounds & Surfaces
- **Primary background**: `bg-white` (main container)
- **Secondary surface**: `bg-slate-50` (cards, hover states, low-emphasis areas)
- **Tertiary surface**: `bg-slate-100` (table headers, section backgrounds)
- **Hover state**: `hover:bg-slate-50` or `hover:bg-slate-100` (depending on context)

### Text & Foreground
- **Primary text**: `text-slate-900` (main content, high contrast)
- **Secondary text**: `text-slate-700` (labels, descriptions)
- **Tertiary text**: `text-slate-600` (meta info, disabled states)
- **Placeholder text**: `placeholder-slate-500`

### Borders & Dividers
- **Primary border**: `border-slate-300` (visible but subtle)
- **Secondary border**: `border-slate-200` (lighter, less emphasis)

### Semantic Colors

#### Success / Primary Action
- Background: `bg-emerald-600` with `hover:bg-emerald-700` and `active:bg-emerald-800`
- Text: `text-white`
- Use for: Create, save, submit actions
- Component: `Button` with `variant="primary"`

#### Danger / Destructive
- Background: `bg-red-600` with `hover:bg-red-700` and `active:bg-red-800`
- Text: `text-white`
- Use for: Delete, dangerous actions
- Component: `Button` with `variant="danger"`

#### Secondary Action
- Background: `bg-slate-200` with `hover:bg-slate-300` and `active:bg-slate-400`
- Text: `text-slate-900`
- Use for: Edit, modify, secondary actions
- Component: `Button` with `variant="secondary"`

#### Ghost / Tertiary
- Background: Transparent, `hover:bg-slate-100` and `active:bg-slate-200`
- Text: `text-slate-700`
- Use for: Cancel, dismiss, low-emphasis actions
- Component: `Button` with `variant="ghost"`

#### Overdue / Warning
- Swatch/border: `#f59e0b` (amber-500) — kept distinct from Danger (red, used for form errors and destructive actions) so an overdue item doesn't read as an active error
- Use for: assignments past their due date and still incomplete, and calendar events containing such an assignment past their end time
- Follows the same "colored left-border + small swatch" pattern used for course colors and the completed state (`#10b981` emerald-500), rather than introducing new UI chrome

### Feature-Specific Colors

Some features have their own color palettes (e.g., course colors). These are fetched from the API and should be displayed prominently as they are part of the user's data. Display them with a subtle border to maintain visual balance.

---

## Button Component

### Reusable Button Variants

A `Button` component provides consistent styling across the application with four variants:

```tsx
<Button variant="primary" size="md">Create Course</Button>      // Filled green
<Button variant="secondary" size="sm">Edit</Button>           // Light gray
<Button variant="danger" size="sm">Delete</Button>            // Filled red
<Button variant="ghost" size="md">Cancel</Button>             // Transparent
```

### Button Sizes
- **sm**: Small buttons for compact contexts (e.g., table actions) - `px-3 py-1.5 text-sm`
- **md**: Medium buttons for standard actions - `px-4 py-2 text-base`
- **lg**: Large buttons for primary CTAs - `px-6 py-3 text-lg`

### Button States
- **Hover**: Darker background or opacity change
- **Active**: Darker shade of hover color
- **Disabled**: `opacity-50` with cursor-not-allowed

---

## Typography

Use existing Tailwind typography utilities. Limit variation to 2-3 font weights for hierarchy.

### Sizing
- **Page title**: `text-2xl font-bold`
- **Section heading**: `text-xl font-bold`
- **Label/Form label**: `text-sm font-semibold`
- **Body text**: `text-base` (no font-weight modifier)
- **Small text/Meta**: `text-xs` or `text-sm`

### Hierarchy
Use size and weight (not color alone) to establish hierarchy:
- Primary content: larger size, bold weight, primary text color
- Secondary content: smaller size, regular weight, secondary text color

---

## Components & Patterns

### Forms & Inputs
- **Input fields**: White background `bg-white`, border `border-slate-300`
- **Placeholder text**: `placeholder-slate-500`
- **Focus state**: `focus:border-emerald-600` (emerald highlight on focus)
- **Error state**: `border-red-500` with red text feedback
- **Labels**: `text-sm font-semibold text-slate-900 mb-1.5`
- **Spacing**: `space-y-4` between form sections (reduced from 6 for compact forms)

### Buttons (via Button Component)
- Use the `Button` component instead of custom button styling
- Primary actions: `variant="primary"`
- Secondary/edit actions: `variant="secondary"`
- Destructive actions: `variant="danger"`
- Dismissive actions: `variant="ghost"`
- Always include size and disabled state handling

### Tables
- **Header row**: `bg-slate-100` with `border-b border-slate-300`
- **Header text**: `text-slate-900 font-semibold text-left p-4`
- **Data rows**: `border-b border-slate-200`, no background fill
- **Hover row**: `hover:bg-slate-50` for interactivity
- **Spacing**: Padding `p-4` inside cells
- **Action cells**: Use Button component with `size="sm"`

### Modals & Dialogs
- **Backdrop**: Semi-transparent dark `bg-black/50`
- **Modal container**: `bg-white` with `border border-slate-200` and `rounded-lg`
- **Padding**: `p-8` for breathing room
- **Shadow**: Moderate shadow for depth `shadow-lg`
- **Max width**: Forms should be wide (`max-w-2xl`) but not screen-filling
- **Max height**: Tall forms should scroll `max-h-[90vh] overflow-y-auto`

### Color Swatches / Pickers
- **Swatch size**: 48x48px squares
- **Border**: `border-2` with `border-slate-400` (unselected) or `border-emerald-600` (selected)
- **Selected indicator**: White checkmark overlay
- **Spacing**: `gap-2` between swatches for comfortable clicking
- **Hover**: `hover:scale-105` for visual feedback

---

## Spacing & Layout

Use Tailwind spacing scale consistently:

### Page & Container Spacing
- **Page padding**: `p-8` for comfortable margins
- **Max width**: `max-w-6xl` to prevent overly wide layouts
- **Container centering**: `mx-auto` for centered content

### Internal Spacing
- **Tight spacing**: `gap-1`, `gap-2` (4px, 8px)
- **Normal spacing**: `gap-3`, `gap-4` (12px, 16px)
- **Generous spacing**: `gap-6`, `gap-8` (24px, 32px)
- **Padding**: `p-4`, `p-6`, `p-8` (16px, 24px, 32px)

### Section Spacing
- **Between major sections**: `mb-8` or `space-y-8`
- **Between form fields**: `space-y-4`
- **Between buttons**: `gap-3` in button containers

**Rule of thumb**: Use generous spacing in modals and forms. Use tighter spacing in dense tables.

---

## Responsive Design

- **Mobile-first approach**: Design for small screens first, then enhance for larger screens
- **Breakpoints**: Use Tailwind's built-in breakpoints (`sm`, `md`, `lg`, `xl`)
- **Page width**: Constrain with `max-w-6xl mx-auto` on desktop
- **Tables on mobile**: Scroll horizontally with `overflow-x-auto`
- **Modals on mobile**: Take most of screen width with appropriate padding

---

## Accessibility

- **Color contrast**: All text meets WCAG AA standards (4.5:1 for normal text)
- **Focus states**: Buttons have visible focus indicators via borders or outline
- **Labels**: Every form input has an associated `<label>`
- **Semantic HTML**: Use proper heading hierarchy (`h1`, `h2`, etc.), buttons, links
- **Button sizing**: Minimum click target of 44x44px for touch devices
- **ARIA**: Add `aria-labels` for icons-only buttons or unclear actions

---

## Recent Updates (Course Management)

The Course Management feature demonstrates the current design standards:

1. **Reusable Button Component**: Primary (green), Secondary (gray), Danger (red), Ghost (transparent)
2. **Light Theme**: Switched from dark to light theme for better readability
3. **Proportionate Spacing**: Reduced excessive padding and margins to create balance
4. **Wider Modals**: Forms use `max-w-2xl` for better input field sizing
5. **Better Visual Hierarchy**: Updated typography sizes and weights
6. **Improved Readability**: Dark text on light backgrounds, proper contrast throughout

---

## Usage Guidelines for New Features

When implementing a new feature:

1. **Use the Button component** — Don't create custom button styles
2. **Follow the color palette** — Use semantic colors for consistent meaning
3. **Reference this design system** for spacing, typography, and patterns
4. **Keep it minimalist** — Add only necessary elements, avoid decoration
5. **Maintain consistency** — Reuse existing patterns and components
6. **Test responsiveness** — Ensure it works on mobile and desktop
7. **Check accessibility** — Use semantic HTML, add focus states, test contrast

---

## Future Considerations

- **Animation**: Keep animations minimal (focus on transitions, not decorative)
- **Dark mode toggle**: Could be added in future; maintain both theme variants if implemented
- **Custom fonts**: Currently using system fonts via Tailwind; consider adding custom fonts if branding requires it
- **Additional components**: Consider building more reusable components as patterns emerge (cards, modals, dropdowns)
