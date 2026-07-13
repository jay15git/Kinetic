# Design

## Theme

Compact tactile lab page. Neutral-light zinc palette, Geist UI + Geist Mono metadata/code, machined small radii, shadow rings instead of thick borders.

## Color Strategy

Restrained: zinc ink on white/off-white radial background, blue focus ring (`#6b97ff`), green/amber reserved for status only.

## Palette

| Token | Value | Use |
|-------|-------|-----|
| `--landing-ink` | `#18181b` | Primary text |
| `--landing-ink-2` | `#52525b` | Secondary text |
| `--landing-ink-3` | `#a1a1aa` | Muted metadata |
| `--landing-hairline` | `rgba(0,0,0,0.07)` | Row separators |
| `--landing-bg` | radial `#fff → #f4f4f5` | Page background |
| `--focus-ring` | `#6b97ff` | Focus states |

## Typography

- UI: Geist, 14px/1.5, tracking `-0.01em`
- Mono: Geist Mono for labels, commands, code (12–12.5px)
- h1: 17px/600, tracking `-0.02em`
- Section titles: 13px/600
- Tagline: 14px, `text-wrap: pretty`

## Layout

- Page shell: grid center, `min-height: 100dvh`, `max-width: 440px`, padding `56px 24px` (mobile `36px 18px 44px`)
- Workbench composition: header → tagline → live fields → settings → install/props → footer
- Section gaps: 36–44px

## Radii

Controls 6px, command fields 9px, code cards 10px. No radii above 16px on surfaces.

## Shadows

Control ring: `0 0 0 1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 5px rgba(0,0,0,0.08)`

Card: `0 0 0 1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)`

## Motion

Ease: `cubic-bezier(0.2, 0, 0, 1)`. Page entrance stagger 90ms steps, 600ms duration. Press feedback: scale 0.96. Animate opacity/transform/filter only.

## Components

- **Header**: product name left, GitHub link right
- **Install command**: full-width mono field with copy, shadow-card
- **Demo rows**: hairline-separated, 52px min-height
- **Settings**: compact panel, no nested card-in-card
- **Code blocks**: translucent white, blur, syntax accent in purple/teal
