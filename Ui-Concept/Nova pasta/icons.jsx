// Simple SVG icon set — stroke-based, 24x24 viewBox.
// All icons accept the same {size, className, ...rest} props.

const Icon = ({ children, size = 18, className = '', strokeWidth = 1.75, ...rest }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       className={className} {...rest}>{children}</svg>;

// ── Brand mark ───────────────────────────────────────────────────────
const Logo = ({ size = 22, className = '' }) =>
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
    <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" opacity="0.12"/>
    <path d="M9 13l-3 3 3 3M23 19l3-3-3-3M11 16h10M16 9v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;

// ── Generic icons ────────────────────────────────────────────────────
const I = {
  Search:    (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  X:         (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Plus:      (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Check:     (p) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>,
  Chev:      (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ChevDown:  (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  ArrowL:    (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></Icon>,
  ArrowR:    (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>,
  ArrowSwap: (p) => <Icon {...p}><path d="M7 7h14l-3-3M17 17H3l3 3"/></Icon>,
  Menu:      (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>,
  Dots:      (p) => <Icon {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Icon>,
  Grid:      (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  List:      (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></Icon>,
  Filter:    (p) => <Icon {...p}><path d="M3 6h18M6 12h12M10 18h4"/></Icon>,
  Sort:      (p) => <Icon {...p}><path d="M3 6h13M3 12h9M3 18h5M17 14l4 4 4-4M21 6v12" /></Icon>,
  Heart:     (p) => <Icon {...p}><path d="M19 14c1.5-1.5 3-3.2 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></Icon>,
  HeartFill: (p) => <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="currentColor" className={p.className}><path d="M12 21s-7-4.5-9.5-9C.8 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.2 4.5 4.5 8C19 16.5 12 21 12 21Z"/></svg>,
  Star:      (p) => <Icon {...p}><path d="M12 2 14.7 8.6 22 9.3l-5.5 4.7 1.7 7L12 17.3 5.8 21l1.7-7L2 9.3l7.3-.7Z"/></Icon>,
  StarFill:  (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="currentColor" className={p.className}><path d="M12 2 14.7 8.6 22 9.3l-5.5 4.7 1.7 7L12 17.3 5.8 21l1.7-7L2 9.3l7.3-.7Z"/></svg>,
  Pin:       (p) => <Icon {...p}><path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></Icon>,
  Map:       (p) => <Icon {...p}><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z"/><path d="M9 4v16M15 6v16"/></Icon>,
  Compass:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m9 15 1.5-4.5L15 9l-1.5 4.5Z"/></Icon>,
  Msg:       (p) => <Icon {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z"/></Icon>,
  Bell:      (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 6 3 8 3 8H3s3-2 3-8M10 21a2 2 0 0 0 4 0"/></Icon>,
  User:      (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  Settings:  (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Icon>,
  Shield:    (p) => <Icon {...p}><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></Icon>,
  Wrench:    (p) => <Icon {...p}><path d="M15 6.5a3.5 3.5 0 1 1-5 5L4 17.5 6.5 20 12.5 14a3.5 3.5 0 0 0 5-5Z"/></Icon>,
  Tools:     (p) => <Icon {...p}><path d="m14.7 6.3 3 3-9.3 9.3-3-3z"/><path d="m18 3 3 3-2 2-3-3z"/><path d="m3 16 5 5"/></Icon>,
  Hand:      (p) => <Icon {...p}><path d="M9 11V4a1.5 1.5 0 0 1 3 0v6M12 11V3a1.5 1.5 0 0 1 3 0v7M15 11V5a1.5 1.5 0 0 1 3 0v9a7 7 0 0 1-14 0V9a1.5 1.5 0 0 1 3 0v3"/></Icon>,
  Camera:    (p) => <Icon {...p}><path d="M23 19V8a2 2 0 0 0-2-2h-3l-2-3H8L6 6H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2Z"/><circle cx="12" cy="13" r="4"/></Icon>,
  Book:      (p) => <Icon {...p}><path d="M4 19a2 2 0 0 1 2-2h14V3H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 0 2 2h14"/></Icon>,
  Globe:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>,
  Music:     (p) => <Icon {...p}><path d="M9 18V6l12-3v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="15" r="3"/></Icon>,
  Code:      (p) => <Icon {...p}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6M14 4l-4 16"/></Icon>,
  Palette:   (p) => <Icon {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2a10 10 0 1 0 4 19c.7-.3.5-1.4-.3-1.7a3 3 0 0 1 1.3-5.8H19a3 3 0 0 0 3-3A10 10 0 0 0 12 2Z"/></Icon>,
  Leaf:      (p) => <Icon {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 17-9 0 13-4 17-9 17a7 7 0 0 1-1-3"/><path d="M2 21c3-2 6-5 9-9"/></Icon>,
  Chef:      (p) => <Icon {...p}><path d="M6 21h12V12a4 4 0 1 0-3-7 4 4 0 1 0-6 0 4 4 0 1 0-3 7Z"/><path d="M6 16h12"/></Icon>,
  Dumbbell:  (p) => <Icon {...p}><path d="M6 5v14M2 8v8M18 5v14M22 8v8M6 12h12"/></Icon>,
  Car:       (p) => <Icon {...p}><path d="M3 15v-4l2-5h14l2 5v4M3 15h18M3 15v3h3v-3M21 15v3h-3v-3"/></Icon>,
  Sparkles:  (p) => <Icon {...p}><path d="M12 3v6M9 6h6M19 12v4M17 14h4M6 16v3M5 17.5h3"/></Icon>,
  Clock:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Calendar:  (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>,
  Send:      (p) => <Icon {...p}><path d="m4 12 17-9-7 18-3-7Z"/></Icon>,
  Paperclip: (p) => <Icon {...p}><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 8"/></Icon>,
  Image:     (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L4 21"/></Icon>,
  Eye:       (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Edit:      (p) => <Icon {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></Icon>,
  Trash:     (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>,
  Pause:     (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></Icon>,
  Play:      (p) => <Icon {...p}><path d="m6 4 14 8-14 8Z"/></Icon>,
  Sun:       (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Icon>,
  Moon:      (p) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></Icon>,
  Logout:    (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Icon>,
  Lock:      (p) => <Icon {...p}><rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></Icon>,
  Key:       (p) => <Icon {...p}><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2-3 3 3 3-3 3-3-3"/></Icon>,
  Doc:       (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 14h6M9 18h6M9 10h2"/></Icon>,
  Card:      (p) => <Icon {...p}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20M6 15h3"/></Icon>,
  Phone:     (p) => <Icon {...p}><path d="M22 16.9V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 3.1 1 1 0 0 1 3 2h4.1a1 1 0 0 1 1 .8l1 4a1 1 0 0 1-.3 1L7 9.7a16 16 0 0 0 7.3 7.3l1.9-1.9a1 1 0 0 1 1-.3l4 1a1 1 0 0 1 .8 1Z"/></Icon>,
  Layers:    (p) => <Icon {...p}><path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></Icon>,
  Info:      (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></Icon>,
  Spark:     (p) => <Icon {...p}><path d="M12 2 14 9l7 2-7 2-2 7-2-7-7-2 7-2Z"/></Icon>,
  Refresh:   (p) => <Icon {...p}><path d="M21 4v6h-6M3 20v-6h6M21 10a9 9 0 0 0-15.5-3M3 14a9 9 0 0 0 15.5 3"/></Icon>,
};

const CAT_ICON = {
  wrench: I.Wrench, leaf: I.Leaf, chef: I.Chef, code: I.Code, music: I.Music,
  globe: I.Globe, dumbbell: I.Dumbbell, palette: I.Palette, car: I.Car,
  camera: I.Camera, book: I.Book, sparkles: I.Sparkles,
};

Object.assign(window, { Icon, Logo, I, CAT_ICON });
