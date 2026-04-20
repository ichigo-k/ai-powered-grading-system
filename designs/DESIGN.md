# Design System Document: The Academic Precision Framework

## 1. Overview & Creative North Star: "The Digital Chancellor"
To elevate the GCTU online exam platform from a utility to a premium academic experience, we are moving away from "standard" portal aesthetics. Our North Star is **"The Digital Chancellor"**—an editorial-inspired philosophy that combines the authoritative weight of a traditional university with the fluid, modern breathability of high-end ed-tech. 

We reject the rigid, boxy layouts of legacy academic software. Instead, we embrace **Intentional Asymmetry** and **Tonal Depth**. By utilizing wide margins, overlapping elements, and a "paper-on-glass" layering logic, we create an environment that minimizes exam anxiety while maximizing focus.

## 2. Colors & Atmospheric Tones
The palette is rooted in GCTU’s heritage but refined for digital endurance. We use a "Deep Sea" primary and a "Golden Horizon" accent, balanced against a sophisticated neutral scale.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, designers must use background shifts. For example, a `surface-container-low` side-panel sitting against a `surface` main content area. This creates a "seamless" feel that reduces visual noise during high-stakes testing.

### Surface Hierarchy & Nesting
Treat the UI as a physical desk.
- **Base Layer:** `surface` (#f8f9fa) — The desk surface.
- **Section Layer:** `surface-container-low` (#f3f4f5) — Large organizational zones.
- **Focus Layer:** `surface-container-lowest` (#ffffff) — Cards and interactive content.

### The "Glass & Gradient" Rule
For floating elements like "Time Remaining" or "Question Navigation" drawers, use **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `24px` backdrop blur. 
*   **Signature Textures:** Main Action Buttons (Submit Exam) should use a subtle linear gradient from `primary` (#001e40) to `primary_container` (#003366) at a 135-degree angle to add "soul" and tactile depth.

## 3. Typography: The Editorial Voice
We use a dual-typeface system to balance authority with readability.

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels modern and institutional. Use `headline-lg` for dashboard welcomes and `headline-sm` for question titles.
*   **Body & Labels (Inter):** A workhorse for legibility. All exam questions must be rendered in `body-lg` with a custom line-height of 1.6 to prevent "line-skipping" during reading.
*   **Hierarchy Note:** Use `on_surface_variant` (#43474f) for secondary metadata (e.g., "3 points") to create a clear visual distinction from the primary question text.

## 4. Elevation & Depth: Tonal Layering
We do not use harsh shadows. Hierarchy is achieved through the **Layering Principle**.

*   **Ambient Shadows:** If an element must float (e.g., a modal or a floating action button), use a "Tincture Shadow": 
    *   `box-shadow: 0 20px 40px rgba(25, 28, 29, 0.06);` 
    *   This mimics natural light and keeps the UI feeling airy.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline_variant` at **15% opacity**. Never use 100% opaque lines.
*   **Micro-Interactions:** When hovering over a `surface-container-lowest` card, transition the background to `surface_bright` and increase the shadow blur—never change the border color.

## 5. Signature Components

### Cards & Question Containers
*   **Rule:** Forbid divider lines. Use `1.5rem` to `2rem` of vertical padding to separate content blocks.
*   **Style:** `surface-container-lowest` background, `xl` (0.75rem) corner radius.

### The "GCTU Progress" Bar
*   **Track:** `surface-container-highest` (#e1e3e4).
*   **Indicator:** `secondary` (GCTU Gold).
*   **Detail:** Add a subtle `primary` glow to the leading edge of the progress bar to signify active movement.

### File Upload (Submission Zone)
*   **Style:** Dashed "Ghost Border" using `surface_tint` at 20% opacity. 
*   **Empty State:** Use a large `primary_fixed` icon to anchor the center.

### Dashboards (Role-Based)
*   **Student:** High focus. Minimalist sidebar. Large `display-sm` greeting. 
*   **Lecturer:** Data-dense. Uses `surface-container-high` for "Status Badges" to distinguish between "Graded" and "Pending" submissions.
*   **Admin:** System-wide. Uses `tertiary_container` for high-priority alerts and system health metrics.

### Buttons
*   **Primary:** Gradient-filled (Primary to Primary Container). Rounded `md` (0.375rem).
*   **Secondary:** Ghost style. No fill, `surface_tint` text, and a subtle `surface_container_high` background on hover.

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts for dashboards (e.g., a 70/30 split between main content and a "Status" rail).
*   **Do** use `secondary_fixed` (Gold) sparingly for high-value interactions (e.g., "Mark as Final").
*   **Do** ensure `on_surface` text always maintains a 7:1 contrast ratio against the `surface` background.

### Don't:
*   **Don't** use pure black (#000000) for text; use `on_surface` (#191c1d) to reduce eye strain.
*   **Don't** use 1px solid borders to separate list items. Use 12px of vertical whitespace or a subtle color shift to `surface_container_low`.
*   **Don't** use standard "drop shadows." If it doesn't look like light passing through glass, it’s too heavy.