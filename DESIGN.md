# Aku Mw Magang — Design System

Diadaptasi dari sistem desain Linear (referensi Layer B) untuk aplikasi
job-application tracker yang padat data. Semua token di bawah adalah kontrak
implementasi; tidak ada warna/ukuran di luar file ini.

## 1. Atmosphere & Identity

Sebuah command center yang tenang dan presisi — seperti Linear: kepadatan
informasi dikelola lewat gradasi luminance, bukan warna mencolok. Signature:
**luminance stacking** (permukaan naik tingkat lewat langkah terang, bukan
shadow keras) dan **satu aksen indigo** yang hanya muncul pada elemen
interaktif. Angka (match score, timer, Rp) memakai tabular numerals dan
menjadi jangkar visual halaman. Momen khas: match score yang tampil sebagai
ring progress mini di tiap kartu lowongan.

Soal requirement mapping: warna badge hijau/kuning/merah, status badge, dan
seluruh state (loading/error/empty/disabled) dipertahankan persis sesuai
spesifikasi Modul 5 — diangkat kualitasnya, bukan diubah semantiknya.

## 2. Color

Semua warna light theme dalam OKLCH; dark = pasangan L lebih rendah.
Aksen: indigo Linear (#5e6ad2 family). Status ramp badge NILAI speifik
(hijau ≥70, kuning 40–69, merah <40) — dipertegas kontras antar langkah.

| Role | Token | Light | Dark |
|------|-------|-------|------|
| Surface/canvas | --bg | oklch(98.5% 0.002 250) #f7f8f8 | #0e0f11 |
| Surface/panel | --panel | #ffffff | #131417 |
| Surface/elevated | --elevated | #ffffff (+ring) | #1a1b1e |
| Surface/inset | --inset | oklch(96.8% 0.002 250) #f1f2f3 | #0a0b0d |
| Text/primary | --text | #17181a | #f7f8f8 |
| Text/secondary | --text-2 | #565c66 | #d0d6e0 |
| Text/muted | --text-3 | #828892 | #8a8f98 |
| Border/default | --border | rgba(23,24,26,0.09) | rgba(255,255,255,0.09) |
| Border/subtle | --border-2 | rgba(23,24,26,0.05) | rgba(255,255,255,0.05) |
| Accent/primary | --accent | #5e6ad2 | #7170ff |
| Accent/hover | --accent-h | #6e79dd | #828fff |
| Accent/soft | --accent-soft | rgba(94,106,210,0.10) | rgba(113,112,255,0.14) |
| Accent/text | --accent-txt | #4a55b8 | #98a0ff |
| Status/high (match ≥70) | --hi | #16a34a | #34d399 |
| Status/high bg | --hi-bg | oklch(94% 0.06 155) | rgba(52,211,153,0.13) |
| Status/mid (40–69) | --md | #b45309 | #fbbf24 |
| Status/mid bg | --md-bg | oklch(95% 0.05 85) | rgba(251,191,36,0.12) |
| Status/low (<40) | --lo | #dc2626 | #f87171 |
| Status/low bg | --lo-bg | oklch(95% 0.02 25) | rgba(248,113,113,0.12) |
| Danger/action | --danger | #dc2626 | #f87171 |

Rules: aksen hanya untuk elemen interaktif/aktif; nilai status memakai ramp
3 langkah dengan background tint masing-masing (bukan teks telanjang);
disabled = teks --text-3 di permukaan --inset dengan cursor not-allowed.

## 3. Typography

Primary: **Inter Variable** (`font-feature-settings: "cv01", "ss03"`) dengan
fallback system-ui. Mono (timer, ID, angka Rp): **ui-monospace stack** —
tanpa dependensi eksternal agar bundle kecil.

| Level | Size | Weight | LH | Tracking |
|-------|------|--------|----|----------|
| Display | 1.5rem | 590 | 1.1 | -0.02em |
| H2 | 1.125rem | 590 | 1.3 | -0.01em |
| H3 | 0.9375rem | 590 | 1.4 | 0 |
| Body | 0.875rem | 400 | 1.55 | -0.006em |
| Body/strong | 0.875rem | 510 | 1.5 | 0 |
| Caption | 0.75rem | 510 | 1.4 | 0 |
| Overline | 0.6875rem | 590 | 1.3 | 0.07em, uppercase |
| Data | 0.9375rem | 590 | 1 | tabular-nums |

Rules: maksimum 590; angka data (skor, Rp, timer, statistik) selalu
`font-variant-numeric: tabular-nums`; monospace hanya untuk timer & ID.

## 4. Spacing & Layout

Base 4px. Container max 1120px, padding-inline 20px (16px mobile).
Grid kartu: `repeat(auto-fill, minmax(19rem, 1fr))`, gap 14px.
Breakpoints: 375 (1 kolom), 768 (2–3 kolom), 1280 (penuh).

## 5. Components

### Badge (status & match)
Pill `--radius-full`, padded 3px 9px, caption size. Status pipeline:
tint background + teks strong. Match: tint bg + skor tabular.
States: none (informasional). A11y: `aria-label` score di ring.

### Match ring
SVG circle 30px, stroke ramp color, `stroke-dashoffset` = skor kelas
(steps 0/25/50/75/100%), angka di tengah (caption, 590).

### Button
Base: radius 7px, padding 7px 13px, body-strong, transition 160ms.
Variants: primary (accent bg, white), ghost (inset bg, border, text),
soft (accent-soft bg, accent-txt), danger (lo ramp). Disabled: inset bg,
text-3. States: hover (bg shift), active `scale(0.98)`, focus-visible
ring `0 0 0 3px accent-soft, 0 0 0 1px accent`.

### Chip (skill)
Pill, accent-soft bg, accent-txt, hover memperlihatkan × (hapus) via
opacity transition; × adalah icon stub SVG 8px, bukan karakter teks.

### Card (job / wr)
Panel bg + border; header: dyad (role · company), kanan match ring;
meta: skills sebagai chip mini; footer: aksi tertata kanan.
Hover: border → accent 40%, translateY(-1px). Selected: ring accent.

### Stat card
Panel, overline label, Data-size value tabular; delta kecil bila relevan.

### Toast (undo)
Elevated surface, ring, shadow xs; enter: translateY(6px)+opacity 240ms.

### Field / form input
Inset bg: terang (light) dan gelap (dark), border, radius 7px, prefiks ikon opsional saat fokus. Focus ring sama dengan button.

## 6. Motion & Interaction

| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover, press) | 140ms | ease-out |
| Standard (panel, toast) | 220ms | cubic-bezier(0.16,1,0.3,1) |
| Emphasis (modal) | 320ms | cubic-bezier(0.16,1,0.3,1) |

Hanya `transform`, `opacity`, `color/background/border` via transition.
`prefers-reduced-motion: reduce` → durasi 0.01ms untuk semua animasi.
Hover hanya pada elemen interaktif; tidak ada motion dekoratif.

## 7. Depth & Surface

Strategi: **luminance stacking + whisper borders** (Linear model):
- Level 0 canvas, Level 1 panel, Level 2 elevated (+ring & shadow xs),
  recessed = inset.
- Dark mode: naikkan luminance tiap level, JANGAN shadow gelap.
- Light mode: shadow sangat halus hanya di elevated/toast, bukan kartu biasa.

## 8. Accessibility Constraints & Accepted Debt

Constraints: target WCAG 2.2 AA — kontras body ≥4.5:1, fokus terlihat
di semua elemen interaktif (focus-visible ring), seluruh state soal
(loading/error/empty/disabled) tetap ada dan bisa dioperasikan keyboard.
`<html lang="id">`, landmark semantic (nav/main), label semua input.

Accepted Debt:
| Item | Location | Alasan | Exit |
|------|----------|--------|------|
| Radio sumber data native | App.tsx | Biaya custom segmented control > nilai; tetap kontras AA | Jika ada waktu sebelum demo |
| Tanpa skeleton loader | JobList | Loading state teks sudah lolos soal; skeleton nilai tambah | Pasca-praktikum |
