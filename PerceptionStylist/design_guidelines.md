# Perception Extension - Font Customization Interface Design Guidelines

## Design Approach

**System**: Material Design with accessibility-first principles
**Justification**: The extension serves users with disabilities requiring clear, predictable interfaces with strong visual feedback and excellent accessibility support.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter (Google Fonts) - excellent readability at all sizes
- **Headers**: Font weight 600, sizes: text-xl (20px) for section headers
- **Body Text**: Font weight 400, text-base (16px) for labels, text-sm (14px) for descriptions
- **Preview Text**: User-selected font family, dynamic sizing based on slider value

### B. Layout System
**Spacing Units**: Tailwind units of 3, 4, 6, and 8 (e.g., p-4, gap-6, mb-8)
- Container padding: p-6
- Section spacing: mb-6
- Element gaps: gap-4
- Tight groupings: space-y-3

### C. Component Library

**Font Style Selector**
- Radio group or segmented control displaying font family names
- Each option shows font name in its actual typeface
- 5 options: Arial, Verdana, Georgia, Times New Roman, Courier
- Active state clearly distinguished with border treatment
- Minimum touch target: 48px height

**Font Size Slider**
- Range: 12px to 24px with clear markers
- Live preview updating as slider moves
- Numerical display showing current px value
- Step increments of 1px
- Slider track with filled/unfilled visual distinction

**Preview Panel**
- Bordered container displaying sample text
- Background differentiation from settings panel
- Shows "The quick brown fox jumps over the lazy dog" in selected font/size
- Minimum height to accommodate largest font size comfortably

**Action Buttons**
- Primary button: "Apply Settings" - prominent positioning
- Secondary button: "Reset to Default" - less prominent but accessible
- Buttons span full width on mobile, inline on larger viewports
- Minimum height: 44px for accessibility

**Settings Section Structure**
- Clear visual separation between Font Style and Font Size sections
- Section headers with subtle bottom borders or background treatment
- Logical top-to-bottom flow: Style → Size → Preview → Actions

### D. Animations
Minimal, purposeful animations only:
- Smooth slider transitions (200ms ease)
- Preview text updates with subtle fade (150ms)
- No decorative animations

## Accessibility Mandates

- All interactive elements meet WCAG AA contrast requirements minimum
- Focus indicators clearly visible on all controls
- Keyboard navigation fully supported (tab order: style selector → size slider → buttons)
- ARIA labels on all form controls
- Screen reader announcements for value changes
- Touch targets minimum 44x44px
- Form inputs with associated labels using proper HTML semantics

## Layout Specifications

**Settings Panel Container**
- Maximum width: 480px for optimal form readability
- Vertical layout on all viewports (no multi-column for settings forms)
- Consistent left alignment for all elements
- Padding: p-6 on desktop, p-4 on mobile

**Visual Hierarchy**
1. Section header (Font Style/Font Size)
2. Helper text explaining the control
3. Interactive control (radio group/slider)
4. Live preview below controls
5. Action buttons at bottom

**Responsive Behavior**
- Single column at all breakpoints (settings forms shouldn't split)
- Font preview scales proportionally
- Buttons stack vertically on mobile, inline on desktop
- Slider maintains usability at all viewport sizes

## Integration Notes

- Settings persist via backend API on "Apply Settings" click
- Loading states shown during API calls
- Success/error feedback via toast notifications (top-right, 3-second duration)
- Reset functionality calls API to clear stored preferences
- Initial load fetches current settings from backend to populate form