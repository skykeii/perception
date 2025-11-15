# Design Guidelines: Perception Accessibility Extension

## Design Approach

**Selected Approach**: Design System - Material Design with accessibility enhancements

**Rationale**: This is a Chrome extension focused on accessibility and utility. The interface must prioritize clarity, high contrast, keyboard navigation, and screen reader compatibility. Material Design provides proven accessible patterns while allowing customization for specialized accessibility features.

**Core Principles**:
- Accessibility-first: WCAG AAA compliance as baseline
- Clarity over decoration: Every element serves a functional purpose
- Immediate value: Features accessible within 1-2 clicks
- Consistent feedback: Clear states for all interactions

---

## Typography

**Font Family**: 
- Primary: Inter (clean, highly legible sans-serif)
- Fallback: System UI fonts

**Scale**:
- Headings: text-xl (20px) - bold
- Section titles: text-base (16px) - semibold  
- Body text: text-sm (14px) - regular
- Helper text: text-xs (12px) - regular
- Minimum size: 14px for body text (accessibility requirement)

**Line Height**: Generous 1.6 for readability

---

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, and 8
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (between elements)
- Section spacing: p-6, gap-6 (major sections)
- Page margins: p-8 (outer containers)

**Extension Popup**:
- Fixed width: 400px
- Max height: 600px (scrollable)
- Sections clearly separated with dividers

**Settings Page**:
- Single column layout (max-w-2xl centered)
- Grouped settings in cards with clear labels

---

## Component Library

### Navigation
- **Top Bar**: Fixed header with logo, page title, and action button (Settings gear icon)
- **Tab Navigation**: Horizontal tabs for switching between Cognitive/Visual/Motor categories
- Use Heroicons for all interface icons

### Forms & Controls
- **Toggle Switches**: Large touch targets (minimum 44x44px), clear on/off states with labels
- **Sliders**: High contrast track with clear thumb indicator, numerical value display
- **Buttons**: 
  - Primary: Solid background, clear text
  - Secondary: Outlined style
  - Minimum height: h-10 (40px)
  
### Feature Cards
- Each accessibility feature in its own card component
- Structure: Icon + Title + Description + Toggle/Control
- Spacing: p-4 internal padding
- Clear visual separation with subtle borders

### Status Indicators
- Active features: Green indicator dot
- Disabled features: Gray with lower opacity
- Badge counts for enabled features

### Onboarding Flow
- Multi-step wizard (3-4 screens)
- Progress indicator at top
- Large, checkbox-style selection cards
- Welcoming illustration on first screen
- Clear "Skip" and "Next" navigation

---

## Accessibility Enhancements

**High Contrast Mode Support**:
- All components must work in forced colors mode
- Use semantic color names, not decorative ones
- Test with Windows High Contrast themes

**Keyboard Navigation**:
- Visible focus indicators (2px outline)
- Logical tab order
- Keyboard shortcuts for common actions

**Screen Reader Optimization**:
- Proper ARIA labels on all interactive elements
- Live regions for dynamic updates
- Descriptive button text (no icon-only buttons without labels)

**Touch Targets**:
- Minimum 44x44px for all clickable elements
- Adequate spacing between interactive elements (minimum 8px)

---

## Visual Hierarchy

**Information Architecture**:
1. Extension icon + title (always visible)
2. Active features summary/quick toggles
3. Category tabs (Cognitive/Visual/Motor)
4. Feature list with toggles
5. Advanced settings link

**Emphasis Strategy**:
- Primary actions: Bold, higher contrast
- Secondary info: Lighter weight, subdued
- Warnings/alerts: Amber accent for important notices
- Success states: Green confirmation messages

---

## Motion & Interaction

**Minimal Animation**: 
- Use sparingly - only for meaningful transitions
- Toggle switches: Smooth 200ms ease transition
- Page transitions: Simple 150ms fade
- NO decorative animations (respects motion sensitivity)

**Interaction Feedback**:
- Instant visual response to clicks
- Loading states for AI features (spinner + descriptive text)
- Success/error toasts (auto-dismiss after 4 seconds)

---

## Content Strategy

**Feature Descriptions**:
- Short, benefit-focused descriptions (1 sentence max)
- Use simple language (8th grade reading level)
- Action-oriented language ("Blocks distracting motion" not "Motion blocking capability")

**Help Content**:
- Tooltip icons next to complex features
- Link to detailed documentation for advanced features
- In-context help rather than separate help pages

---

## Images

**No decorative images required** for core extension interface.

**Icon Usage**:
- Heroicons throughout (outline style for inactive, solid for active)
- Feature category icons: Brain (Cognitive), Eye (Visual), Hand (Motor)
- 24x24px standard size, 32x32px for category headers

**Onboarding Illustrations** (first-time user flow):
- Welcome screen: Simple, inclusive illustration showing diverse users
- Style: Flat, minimal, high contrast
- Placement: Centered, above welcome text
- Size: 200x200px maximum

---

## Extension-Specific Patterns

**Popup Interface**:
- Quick access panel showing currently active features
- One-click toggles for most common features
- "Open full settings" link at bottom

**Settings Page** (full tab):
- Persistent sidebar navigation for categories
- Searchable feature list
- Export/import preferences functionality
- Reset to defaults option

**Badge Integration**:
- Extension badge shows count of active features
- Badge color indicates mode (default/custom)