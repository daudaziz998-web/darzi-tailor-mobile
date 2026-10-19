/**
 * Default Tailor Measurement Reference Diagrams (SVG)
 * Shows WHERE and HOW each measurement is taken on the garment/body.
 */

export const defaultMeasurementDiagrams: Record<string, string> = {
  // 1. Neck - Tape wrapped around the base of the neck
  neck: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Head & Neck Outline -->
    <path d="M38 18 C38 10 62 10 62 18 C62 26 58 32 58 38 L68 44 C80 48 84 56 86 68 L14 68 C16 56 20 48 32 44 L42 38 C42 32 38 26 38 18 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Collar Line -->
    <path d="M42 38 Q50 42 58 38" fill="none" stroke="%2394a3b8" stroke-width="1.5"/>
    <!-- Measuring Tape (Yellow Loop) -->
    <ellipse cx="50" cy="38" rx="14" ry="5" fill="%23fef08a" stroke="%23ca8a04" stroke-width="2.5" stroke-dasharray="2,2"/>
    <!-- Arrow & Indicator -->
    <path d="M50 46 L50 56 M47 52 L50 56 L53 52" stroke="%23b45309" stroke-width="2" fill="none"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">NECK / گردن</text>
  </svg>`,

  // 2. Chest - Measuring tape across fullest part of chest
  chest: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Torso Silhouette -->
    <path d="M35 15 L65 15 L78 30 L74 72 L26 72 L22 30 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <path d="M42 15 Q50 20 58 15" fill="none" stroke="%2394a3b8" stroke-width="1.5"/>
    <!-- Chest Measurement Tape -->
    <line x1="20" y1="36" x2="80" y2="36" stroke="%23ca8a04" stroke-width="4"/>
    <line x1="20" y1="36" x2="80" y2="36" stroke="%23fde047" stroke-width="2.5" stroke-dasharray="3,1.5"/>
    <!-- Arrows at ends -->
    <path d="M22 33 L18 36 L22 39 M78 33 L82 36 L78 39" fill="none" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">CHEST / چھاتی</text>
  </svg>`,

  // 3. Waist - Tape wrapped at natural waistline
  waist: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Torso with Inward Waist Curve -->
    <path d="M35 15 L65 15 L76 28 Q64 48 74 72 L26 72 Q36 48 24 28 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Waist Tape Loop -->
    <ellipse cx="50" cy="48" rx="20" ry="4" fill="%23fef08a" stroke="%23ca8a04" stroke-width="3" stroke-dasharray="2,2"/>
    <!-- Arrows -->
    <path d="M28 48 L22 48 M72 48 L78 48" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">WAIST / کمر</text>
  </svg>`,

  // 4. Hip - Tape at the widest part of hips
  hip: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Lower Torso & Pelvis -->
    <path d="M32 20 L68 20 L78 48 Q80 62 68 74 L32 74 Q20 62 22 48 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Hip Tape Measure -->
    <line x1="18" y1="52" x2="82" y2="52" stroke="%23ca8a04" stroke-width="4"/>
    <line x1="18" y1="52" x2="82" y2="52" stroke="%23fde047" stroke-width="2.5" stroke-dasharray="3,1.5"/>
    <path d="M20 49 L16 52 L20 55 M80 49 L84 52 L80 55" fill="none" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">HIP / ہپ</text>
  </svg>`,

  // 5. Total Length - Vertical tape from shoulder seam to hemline
  totalLength: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Kameez / Kurta Outline -->
    <path d="M38 15 L48 15 L52 18 L62 15 L72 26 L66 32 L60 26 L62 72 L38 72 L40 26 L34 32 L28 26 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="1.8"/>
    <!-- Vertical Tape Down the Front -->
    <line x1="50" y1="16" x2="50" y2="72" stroke="%23ca8a04" stroke-width="3"/>
    <line x1="50" y1="16" x2="50" y2="72" stroke="%23fde047" stroke-width="2" stroke-dasharray="3,1.5"/>
    <!-- Top & Bottom Arrows -->
    <path d="M47 20 L50 16 L53 20 M47 68 L50 72 L53 68" stroke="%23b45309" stroke-width="2" fill="none"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">LENGTH / لمبائی</text>
  </svg>`,

  // 6. Sleeve Length - Along the arm from shoulder point to wrist
  sleeveLength: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Arm Silhouette Bent at Elbow -->
    <path d="M30 18 Q50 20 62 34 L74 60 C76 64 74 68 70 68 L60 66 L50 44 L30 30 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Measuring Tape Along Outer Arm -->
    <path d="M30 18 Q54 22 66 36 L74 64" fill="none" stroke="%23ca8a04" stroke-width="3.5"/>
    <path d="M30 18 Q54 22 66 36 L74 64" fill="none" stroke="%23fde047" stroke-width="2" stroke-dasharray="3,1.5"/>
    <!-- Markers -->
    <circle cx="30" cy="18" r="3" fill="%23b45309"/>
    <circle cx="74" cy="64" r="3" fill="%23b45309"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">SLEEVE / بازو</text>
  </svg>`,

  // 7. Bottom / Paincha - Bottom hem / trouser opening width
  bottom: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Trouser Leg Hem -->
    <path d="M28 15 L24 64 L76 64 L72 15" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <path d="M38 15 L40 50 L60 50 L62 15" fill="%23f8fafc" stroke="%2394a3b8" stroke-width="1.5"/>
    <!-- Bottom Hem Tape Line -->
    <line x1="20" y1="64" x2="80" y2="64" stroke="%23ca8a04" stroke-width="4"/>
    <line x1="20" y1="64" x2="80" y2="64" stroke="%23fde047" stroke-width="2.5" stroke-dasharray="3,1.5"/>
    <!-- Arrows -->
    <path d="M24 61 L20 64 L24 67 M76 61 L80 64 L76 67" fill="none" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">BOTTOM / پانچہ</text>
  </svg>`,

  // 8. Shoulder - Across the back from shoulder tip to shoulder tip
  shoulder: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Upper Back & Shoulders -->
    <path d="M16 46 C24 32 38 28 44 26 C46 22 54 22 56 26 C62 28 76 32 84 46 L78 62 L66 60 L64 42 L36 42 L34 60 L22 62 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Shoulder Tape Across Tips -->
    <line x1="16" y1="36" x2="84" y2="36" stroke="%23ca8a04" stroke-width="4"/>
    <line x1="16" y1="36" x2="84" y2="36" stroke="%23fde047" stroke-width="2.5" stroke-dasharray="3,1.5"/>
    <!-- Arrow tips -->
    <path d="M19 33 L15 36 L19 39 M81 33 L85 36 L81 39" fill="none" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">SHOULDER / کندھا</text>
  </svg>`,

  // 9. Back Width - Across shoulder blades between armholes
  backWidth: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Back Torso View -->
    <path d="M22 30 C30 22 42 20 50 20 C58 20 70 22 78 30 L74 70 L26 70 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Tape across mid-back -->
    <line x1="28" y1="45" x2="72" y2="45" stroke="%23ca8a04" stroke-width="4"/>
    <line x1="28" y1="45" x2="72" y2="45" stroke="%23fde047" stroke-width="2.5" stroke-dasharray="3,1.5"/>
    <!-- End dots -->
    <circle cx="28" cy="45" r="3" fill="%23b45309"/>
    <circle cx="72" cy="45" r="3" fill="%23b45309"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">BACK / پیٹھ</text>
  </svg>`,

  // 10. Upper Arm - Tape wrapped around fullest bicep
  upperArm: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Upper Arm & Bicep Silhouette -->
    <path d="M40 15 C52 15 65 24 66 38 C67 52 58 65 52 75 L38 72 C42 60 40 45 36 30 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Tape measure loop around bicep -->
    <ellipse cx="49" cy="40" rx="16" ry="6" fill="%23fef08a" stroke="%23ca8a04" stroke-width="3" stroke-dasharray="2,2"/>
    <path d="M33 40 L28 40 M65 40 L70 40" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">UPPER ARM / ڈولہ</text>
  </svg>`,

  // 11. Lower Arm - Forearm tape loop below elbow
  lowerArm: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Forearm Silhouette -->
    <path d="M38 18 L62 18 C64 36 58 55 52 72 L40 70 C44 55 40 36 38 18 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Forearm Tape Loop -->
    <ellipse cx="48" cy="44" rx="14" ry="4.5" fill="%23fef08a" stroke="%23ca8a04" stroke-width="3" stroke-dasharray="2,2"/>
    <path d="M34 44 L30 44 M62 44 L66 44" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">LOWER ARM / بازو</text>
  </svg>`,

  // 12. Wrist - Tape wrapped at wrist bone
  wrist: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Arm ending in Hand/Wrist -->
    <path d="M40 15 L60 15 L58 48 L68 56 L62 74 L46 74 L38 56 L42 48 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <!-- Tape Loop around Wrist -->
    <ellipse cx="50" cy="46" rx="12" ry="4" fill="%23fef08a" stroke="%23ca8a04" stroke-width="3" stroke-dasharray="2,2"/>
    <path d="M38 46 L33 46 M62 46 L67 46" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">WRIST / کلائی</text>
  </svg>`,

  // 13. Cuff - Sleeve cuff circumference / opening width
  cuff: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="%23f8fafc" rx="8"/>
    <!-- Sleeve Cuff Detail with Button -->
    <path d="M30 18 L70 18 L72 62 L28 62 Z" fill="%23e2e8f0" stroke="%2364748b" stroke-width="2"/>
    <rect x="28" y="44" width="44" height="18" fill="%23cbd5e1" stroke="%23475569" stroke-width="1.8"/>
    <!-- Cuff Button -->
    <circle cx="58" cy="53" r="3.5" fill="%23ffffff" stroke="%23475569" stroke-width="1.5"/>
    <!-- Measurement Tape Width Across Cuff -->
    <line x1="22" y1="53" x2="78" y2="53" stroke="%23ca8a04" stroke-width="3"/>
    <line x1="22" y1="53" x2="78" y2="53" stroke="%23fde047" stroke-width="2" stroke-dasharray="2,1.5"/>
    <path d="M25 50 L22 53 L25 56 M75 50 L78 53 L75 56" fill="none" stroke="%23b45309" stroke-width="2"/>
    <text x="50" y="85" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="%231e293b">CUFF / کف</text>
  </svg>`,
};
