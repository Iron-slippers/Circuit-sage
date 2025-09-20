# Design Guidelines: Electronics Calculator Web Application

## Design Approach
**Design System Approach** - Using Material Design principles optimized for technical/engineering applications. This utility-focused application prioritizes efficiency, precision, and data clarity over visual flair.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary (Default)**
- Background: 218 23% 12% (deep technical blue-gray)
- Surface: 218 18% 18% (elevated panels)
- Primary: 210 100% 65% (bright technical blue)
- Text Primary: 0 0% 95% (near white)
- Text Secondary: 0 0% 70% (muted gray)
- Success: 142 65% 55% (calculation success)
- Warning: 38 85% 60% (formula validation)
- Error: 0 75% 60% (calculation errors)

**Light Mode**
- Background: 210 20% 98% (clean technical white)
- Surface: 0 0% 100% (pure white panels)
- Primary: 210 100% 50% (deeper technical blue)
- Text Primary: 218 25% 15% (dark technical gray)

### B. Typography
**Google Fonts via CDN:**
- Primary: Inter (clean, technical readability)
- Monospace: JetBrains Mono (formulas, calculations, code)

**Hierarchy:**
- H1: 2rem, semibold (page titles)
- H2: 1.5rem, medium (section headers)
- Body: 0.875rem, regular (general text)
- Code/Formula: 0.875rem, monospace (calculations)
- Small: 0.75rem, regular (units, labels)

### C. Layout System
**Tailwind Spacing Units:** 2, 4, 6, 8, 12, 16
- Tight spacing (p-2, m-2) for form elements
- Standard spacing (p-4, m-4) for cards and sections
- Generous spacing (p-8, m-8) for main layout separation

### D. Component Library

**Navigation**
- Clean sidebar with formula categories
- Breadcrumb navigation for complex formulas
- Search functionality for quick formula access

**Forms & Inputs**
- Labeled input fields with unit selectors
- Scientific notation support
- Real-time validation with clear error states
- Parameter sliders for interactive exploration

**Data Display**
- Formula cards with LaTeX-style mathematical notation
- Results panels with proper scientific formatting
- Calculation history with save functionality
- Interactive graphs using Plotly.js integration

**Overlays**
- Modal dialogs for formula editing
- Tooltip explanations for complex parameters
- Confirmation dialogs for destructive actions

### E. Technical Considerations

**Graph Integration**
- Clean, technical styling matching overall theme
- Axis labels with proper units
- Grid lines for precision reading
- Zoom and pan capabilities for detailed analysis

**Formula Display**
- Mathematical notation rendering
- Variable highlighting
- Unit consistency checking
- Formula derivation explanations

**No Hero Images** - This is a utility application focused on calculations and data visualization rather than marketing appeal.

## Key Design Principles
1. **Precision First**: Every element serves calculation accuracy
2. **Technical Clarity**: Information hierarchy supports complex calculations
3. **Efficient Workflow**: Minimize clicks between formula selection and results
4. **Data Integrity**: Clear validation and error handling throughout
5. **Professional Aesthetics**: Clean, technical appearance suitable for engineering work