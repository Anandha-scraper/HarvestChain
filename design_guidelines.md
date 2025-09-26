# Crop Tracking Application Design Guidelines

## Design Approach
**Selected Approach**: Design System (Material Design)
**Justification**: This is a utility-focused agricultural application where efficiency, reliability, and cross-device compatibility are paramount. Material Design provides excellent mobile patterns essential for farmers working in fields.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 76 60% 45% (Agricultural Green)
- Dark Mode: 76 40% 65% (Softer Green)

**Secondary Colors:**
- Light Mode: 45 70% 50% (Earth Brown)
- Dark Mode: 45 50% 70% (Warm Brown)

**Status Colors:**
- Success: 120 60% 50% (Crop Ready)
- Warning: 38 90% 60% (Processing)
- Error: 0 70% 50% (Issues)

### B. Typography
**Font Family**: Roboto (Google Fonts)
- Headers: Roboto Medium (500)
- Body text: Roboto Regular (400)
- Labels/buttons: Roboto Medium (500)
- Data/numbers: Roboto Mono (monospace for QR codes, prices)

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section margins: m-6, m-8
- Element spacing: gap-2, gap-4
- Mobile-first responsive design with focus on thumb-friendly touch targets

### D. Component Library

**Navigation:**
- Bottom tab navigation for main sections (Dashboard, QR Generate, Scan, Profile)
- Clean header with user info and logout

**Cards:**
- Elevated cards (shadow-md) for farmer info, crop details
- Outlined cards for QR display and scanning results
- Status cards with color-coded borders

**Forms:**
- Material-style floating labels
- Outlined input fields with focus states
- Large, accessible buttons for primary actions
- Dropdown selectors for crop types and GI tags

**QR Components:**
- Centered QR code display with download option
- Quantity selector with +/- controls
- Start/Stop toggle buttons with clear visual states

**Data Display:**
- List items for crop tracking history
- Status badges with appropriate colors
- Price display in prominent, readable format

### E. Key Screens Layout

**Login Screen:**
- Centered form with phone number input
- Numeric keypad-friendly design
- Simple, trust-building header

**Farmer Dashboard:**
- Profile card at top (name, Aadhar, location)
- Registered crops grid
- Quick action buttons for common tasks

**QR Generation:**
- Crop selector dropdown
- GI tag assignment
- Quantity controls (5/kg or single)
- Large QR display area
- Start/Stop/Upload controls

**Scanner Interface:**
- Full-screen camera view
- Overlay guidelines for QR positioning
- Scan result display with crop details
- Price update form

## Images
**No large hero images** - This is a utility application focused on functionality
**Small icons/illustrations:**
- Crop type icons in selection interface
- QR code placeholder graphics
- Status indicator icons (truck, store, consumer icons for supply chain)
- Simple agricultural illustrations for empty states

## Mobile-First Considerations
- Large touch targets (minimum 44px)
- Thumb-friendly navigation
- Offline capability indicators
- Network status awareness
- Camera integration for QR scanning