import React from 'react';
import { StandardMeasurements } from '../types';

export interface MeasurementGuideInfo {
  key: keyof StandardMeasurements;
  titleEn: string;
  titleUr: string;
  guideEn: string;
  guideUr: string;
  renderSvg: (className?: string) => React.ReactNode;
}

export const MEASUREMENT_GUIDES: Partial<Record<keyof StandardMeasurements, MeasurementGuideInfo>> = {
  neck: {
    key: 'neck',
    titleEn: 'Neck',
    titleUr: 'گردن کا ناپ',
    guideEn: 'Wrap tape comfortably around the base of the neck where the collar sits, with one finger allowance.',
    guideUr: 'گردن کی نچلی جڑ کے گرد ناپیں جہاں بین یا کالر بیٹھتا ہے، ایک انگلی کی گنجائش رکھیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Head and Neck Profile/Front */}
        <path d="M50 12 C40 12 36 20 36 30 C36 40 42 46 44 48 C44 54 42 58 30 68 C22 75 18 84 16 92 L84 92 C82 84 78 75 70 68 C58 58 56 54 56 48 C58 46 64 40 64 30 C64 20 60 12 50 12 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Collar Bone line */}
        <path d="M42 62 C46 66 54 66 58 62" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Yellow Measuring Tape around Neck Base */}
        <path d="M38 52 Q50 63 62 52" stroke="#F59E0B" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M39 52 Q50 63 61 52" stroke="#B45309" strokeWidth="1" strokeDasharray="1.5 2" />
        {/* Red Reference Measurement Arrows & Points */}
        <circle cx="38" cy="52" r="2.5" fill="#EF4444" />
        <circle cx="62" cy="52" r="2.5" fill="#EF4444" />
        <path d="M34 50 L38 52 L34 54" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M66 50 L62 52 L66 54" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  chest: {
    key: 'chest',
    titleEn: 'Chest',
    titleUr: 'سینہ کا ناپ',
    guideEn: 'Measure horizontally around the fullest part of the chest, under the armpits, keeping the tape level.',
    guideUr: 'بغلوں کے نیچے سے سینے کے سب سے ابھرے ہوئے حصے کے گرد ٹیپ بالکل سیدھی رکھ کر ناپیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Torso Silhouette */}
        <path d="M32 14 L42 22 L58 22 L68 14 L78 28 L70 42 L66 40 L67 88 L33 88 L34 40 L30 42 L22 28 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Center Placket guide */}
        <line x1="50" y1="22" x2="50" y2="88" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Armhole creases */}
        <path d="M34 40 C36 45 37 50 37 54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M66 40 C64 45 63 50 63 54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Yellow Measuring Tape Across Chest */}
        <rect x="25" y="44" width="50" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="30" y1="44" x2="30" y2="47" stroke="#78350F" strokeWidth="1" />
        <line x1="35" y1="44" x2="35" y2="49" stroke="#78350F" strokeWidth="1" />
        <line x1="40" y1="44" x2="40" y2="47" stroke="#78350F" strokeWidth="1" />
        <line x1="45" y1="44" x2="45" y2="49" stroke="#78350F" strokeWidth="1" />
        <line x1="50" y1="44" x2="50" y2="47" stroke="#78350F" strokeWidth="1" />
        <line x1="55" y1="44" x2="55" y2="49" stroke="#78350F" strokeWidth="1" />
        <line x1="60" y1="44" x2="60" y2="47" stroke="#78350F" strokeWidth="1" />
        <line x1="65" y1="44" x2="65" y2="49" stroke="#78350F" strokeWidth="1" />
        <line x1="70" y1="44" x2="70" y2="47" stroke="#78350F" strokeWidth="1" />
        {/* Red Arrows on ends */}
        <path d="M21 47.5 L25 45 L25 50 Z" fill="#EF4444" />
        <path d="M79 47.5 L75 45 L75 50 Z" fill="#EF4444" />
      </svg>
    ),
  },

  waist: {
    key: 'waist',
    titleEn: 'Waist',
    titleUr: 'کمر کا ناپ',
    guideEn: 'Measure around the natural waistline where the kurta waist or shalwar waistband sits.',
    guideUr: 'قدرتی کمر کے گھیراؤ کے گرد ناپیں جہاں قمیض کی فٹنگ یا شلوار کا نیفہ باندھا جاتا ہے۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Torso narrowing at waist */}
        <path d="M30 18 L40 22 L60 22 L70 18 L76 34 L66 38 C63 48 60 58 63 68 C66 76 68 84 69 90 L31 90 C32 84 34 76 37 68 C40 58 37 48 34 38 L24 34 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Center guide */}
        <line x1="50" y1="22" x2="50" y2="90" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
        {/* Measuring Tape Around Waist (y ~ 60) */}
        <rect x="27" y="58" width="46" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="32" y1="58" x2="32" y2="61" stroke="#78350F" strokeWidth="1" />
        <line x1="38" y1="58" x2="38" y2="63" stroke="#78350F" strokeWidth="1" />
        <line x1="44" y1="58" x2="44" y2="61" stroke="#78350F" strokeWidth="1" />
        <line x1="50" y1="58" x2="50" y2="63" stroke="#78350F" strokeWidth="1" />
        <line x1="56" y1="58" x2="56" y2="61" stroke="#78350F" strokeWidth="1" />
        <line x1="62" y1="58" x2="62" y2="63" stroke="#78350F" strokeWidth="1" />
        <line x1="68" y1="58" x2="68" y2="61" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows */}
        <path d="M23 61.5 L27 59 L27 64 Z" fill="#EF4444" />
        <path d="M77 61.5 L73 59 L73 64 Z" fill="#EF4444" />
      </svg>
    ),
  },

  hip: {
    key: 'hip',
    titleEn: 'Hip',
    titleUr: 'ہپ کا ناپ',
    guideEn: 'Measure horizontally around the fullest part of the hips and seat.',
    guideUr: 'ہپ اور نشست کے سب سے چوڑے حصے کے گرد ٹیپ کو گھما کر ناپیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Lower torso & hips */}
        <path d="M35 15 L65 15 C64 25 66 38 72 52 C77 64 77 75 74 90 L26 90 C23 75 23 64 28 52 C34 38 36 25 35 15 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Pocket slit line indication */}
        <path d="M32 40 L35 55" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M68 40 L65 55" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Measuring Tape Around Hips (y ~ 66) */}
        <rect x="22" y="63" width="56" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="28" y1="63" x2="28" y2="67" stroke="#78350F" strokeWidth="1" />
        <line x1="36" y1="63" x2="36" y2="68" stroke="#78350F" strokeWidth="1" />
        <line x1="44" y1="63" x2="44" y2="67" stroke="#78350F" strokeWidth="1" />
        <line x1="50" y1="63" x2="50" y2="68" stroke="#78350F" strokeWidth="1" />
        <line x1="56" y1="63" x2="56" y2="67" stroke="#78350F" strokeWidth="1" />
        <line x1="64" y1="63" x2="64" y2="68" stroke="#78350F" strokeWidth="1" />
        <line x1="72" y1="63" x2="72" y2="67" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows */}
        <path d="M18 66.5 L22 64 L22 69 Z" fill="#EF4444" />
        <path d="M82 66.5 L78 64 L78 69 Z" fill="#EF4444" />
      </svg>
    ),
  },

  totalLength: {
    key: 'totalLength',
    titleEn: 'Total Length',
    titleUr: 'قد / لمبائی',
    guideEn: 'Measure vertically from highest point of the shoulder at neck base straight down to desired hem length.',
    guideUr: 'کندھے اور گردن کے جوڑ سے بالکل سیدھا نیچے جہاں تک قمیض یا کرتے کا دامن بنانا ہو۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Full Kameez Kurta Outline */}
        <path d="M40 10 L44 14 L56 14 L60 10 L68 15 L64 30 L58 32 L62 90 L38 90 L42 32 L36 30 L32 15 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Daman hem curve */}
        <path d="M38 90 Q50 92 62 90" stroke="#64748B" strokeWidth="1.5" />
        {/* Vertical Yellow Measuring Tape on right side */}
        <rect x="67" y="10" width="7" height="80" rx="1.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        {/* Measurement ticks along height */}
        <line x1="67" y1="20" x2="71" y2="20" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="30" x2="72" y2="30" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="40" x2="71" y2="40" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="50" x2="72" y2="50" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="60" x2="71" y2="60" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="70" x2="72" y2="70" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="80" x2="71" y2="80" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows Top and Bottom */}
        <path d="M70.5 7 L68 11 L73 11 Z" fill="#EF4444" />
        <path d="M70.5 93 L68 89 L73 89 Z" fill="#EF4444" />
        {/* Top alignment guideline */}
        <line x1="44" y1="10" x2="68" y2="10" stroke="#EF4444" strokeWidth="1" strokeDasharray="1.5 1.5" />
        {/* Bottom alignment guideline */}
        <line x1="38" y1="90" x2="68" y2="90" stroke="#EF4444" strokeWidth="1" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },

  sleeveLength: {
    key: 'sleeveLength',
    titleEn: 'Sleeve Length',
    titleUr: 'بازو کا ناپ',
    guideEn: 'Measure from outer tip of shoulder bone down over the slightly bent elbow to the wrist/cuff.',
    guideUr: 'کندھے کی آخری ہڈی کے کنارے سے کہنی کے اوپر سے گزرتے ہوئے کلائی کے جوڑ یا کف تک۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Torso reference and Sleeve silhouette */}
        <path d="M20 18 L32 24 L28 88 L14 88 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
        {/* Arm Sleeve starting from shoulder (32, 24) down along curve */}
        <path d="M32 24 C44 26 56 36 62 52 C67 66 68 80 66 86 L56 88 C58 82 56 70 52 58 C47 46 40 38 30 36 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Cuff band */}
        <path d="M56 88 L66 86" stroke="#94A3B8" strokeWidth="2.5" />
        {/* Measuring Tape following outer edge of sleeve */}
        <path d="M34 22 C48 26 60 38 66 54 C72 70 72 82 70 88" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        <path d="M34 22 C48 26 60 38 66 54 C72 70 72 82 70 88" stroke="#78350F" strokeWidth="1" strokeDasharray="2 2" />
        {/* Red Start & End points */}
        <circle cx="34" cy="22" r="3" fill="#EF4444" />
        <circle cx="70" cy="88" r="3" fill="#EF4444" />
        <path d="M30 19 L35 22 L31 25 Z" fill="#DC2626" />
        <path d="M72 91 L67 88 L70 85 Z" fill="#DC2626" />
      </svg>
    ),
  },

  bottom: {
    key: 'bottom',
    titleEn: 'Bottom (Pancha)',
    titleUr: 'پانچے کا ناپ',
    guideEn: 'Measure the flat width or circumference of the shalwar or trouser leg opening (pancha).',
    guideUr: 'شلوار یا پاجامے کے نچلے پانچے کی چوڑائی یا گولائی کا ناپ۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Lower Shalwar Leg silhouette */}
        <path d="M22 10 L28 66 C29 74 30 78 30 82 L70 82 C70 78 71 74 72 66 L78 10 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Stitched hem rows of pancha */}
        <line x1="30" y1="76" x2="70" y2="76" stroke="#94A3B8" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <line x1="30" y1="79" x2="70" y2="79" stroke="#94A3B8" strokeWidth="1" strokeDasharray="1.5 1.5" />
        {/* Measuring Tape along bottom opening */}
        <rect x="22" y="84" width="56" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="28" y1="84" x2="28" y2="87" stroke="#78350F" strokeWidth="1" />
        <line x1="35" y1="84" x2="35" y2="89" stroke="#78350F" strokeWidth="1" />
        <line x1="42" y1="84" x2="42" y2="87" stroke="#78350F" strokeWidth="1" />
        <line x1="50" y1="84" x2="50" y2="89" stroke="#78350F" strokeWidth="1" />
        <line x1="58" y1="84" x2="58" y2="87" stroke="#78350F" strokeWidth="1" />
        <line x1="65" y1="84" x2="65" y2="89" stroke="#78350F" strokeWidth="1" />
        <line x1="72" y1="84" x2="72" y2="87" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows */}
        <path d="M18 87.5 L22 85 L22 90 Z" fill="#EF4444" />
        <path d="M82 87.5 L78 85 L78 90 Z" fill="#EF4444" />
      </svg>
    ),
  },

  shoulder: {
    key: 'shoulder',
    titleEn: 'Shoulder (Tira)',
    titleUr: 'کندھوں کا ناپ',
    guideEn: 'Measure horizontally across the upper back from the tip of left shoulder bone to right shoulder bone.',
    guideUr: 'پیٹھ کے اوپری حصے سے بائیں کندھے کی ہڈی سے دائیں کندھے کے سرے تک (تیرا) ناپیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Back of neck and shoulders silhouette */}
        <path d="M42 12 C44 24 56 24 58 12 L78 26 L74 48 L68 46 L68 88 L32 88 L32 46 L26 48 L22 26 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Neck collar back curve */}
        <path d="M42 22 Q50 26 58 22" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Shoulder Seam / Measuring Tape straight across shoulder tips (y ~ 26) */}
        <rect x="18" y="24" width="64" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="25" y1="24" x2="25" y2="28" stroke="#78350F" strokeWidth="1" />
        <line x1="33" y1="24" x2="33" y2="29" stroke="#78350F" strokeWidth="1" />
        <line x1="41" y1="24" x2="41" y2="28" stroke="#78350F" strokeWidth="1" />
        <line x1="50" y1="24" x2="50" y2="30" stroke="#78350F" strokeWidth="1" />
        <line x1="59" y1="24" x2="59" y2="28" stroke="#78350F" strokeWidth="1" />
        <line x1="67" y1="24" x2="67" y2="29" stroke="#78350F" strokeWidth="1" />
        <line x1="75" y1="24" x2="75" y2="28" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows at shoulder bone joints */}
        <path d="M14 27.5 L18 25 L18 30 Z" fill="#EF4444" />
        <path d="M86 27.5 L82 25 L82 30 Z" fill="#EF4444" />
        <circle cx="21" cy="27.5" r="2.5" fill="#EF4444" />
        <circle cx="79" cy="27.5" r="2.5" fill="#EF4444" />
      </svg>
    ),
  },

  backWidth: {
    key: 'backWidth',
    titleEn: 'Back Width',
    titleUr: 'پیٹھ کا ناپ',
    guideEn: 'Measure across the back across shoulder blades between the two armhole seam crease lines.',
    guideUr: 'پیٹھ کے آر پار دونوں بغلوں کے درمیانی فاصلے کی چوڑائی ناپیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Back View Silhouette */}
        <path d="M42 14 Q50 20 58 14 L76 24 L70 46 L64 42 L65 88 L35 88 L36 42 L30 46 L24 24 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Shoulder Blades indication */}
        <path d="M42 38 Q40 44 43 50" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M58 38 Q60 44 57 50" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        {/* Measuring Tape Across Back Blades (y ~ 44) */}
        <rect x="29" y="42" width="42" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="35" y1="42" x2="35" y2="45" stroke="#78350F" strokeWidth="1" />
        <line x1="41" y1="42" x2="41" y2="47" stroke="#78350F" strokeWidth="1" />
        <line x1="47" y1="42" x2="47" y2="45" stroke="#78350F" strokeWidth="1" />
        <line x1="53" y1="42" x2="53" y2="47" stroke="#78350F" strokeWidth="1" />
        <line x1="59" y1="42" x2="59" y2="45" stroke="#78350F" strokeWidth="1" />
        <line x1="65" y1="42" x2="65" y2="47" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows */}
        <path d="M25 45.5 L29 43 L29 48 Z" fill="#EF4444" />
        <path d="M75 45.5 L71 43 L71 48 Z" fill="#EF4444" />
      </svg>
    ),
  },

  upperArm: {
    key: 'upperArm',
    titleEn: 'Upper Arm (Bicep)',
    titleUr: 'بازو کا اوپری ناپ',
    guideEn: 'Measure around the fullest part of the bicep / upper arm muscle.',
    guideUr: 'بازو کے اوپری حصے یعنی ڈولے کی گولائی کا سب سے چوڑا ناپ لیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Arm silhouette with prominent bicep */}
        <path d="M42 10 C32 18 28 32 30 48 C32 60 40 74 44 88 L58 86 C56 72 64 58 66 44 C68 30 64 16 54 10 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Measuring Tape Wrapped Around Bicep (y ~ 42) */}
        <ellipse cx="48" cy="42" rx="20" ry="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <path d="M30 42 Q48 48 66 42" stroke="#78350F" strokeWidth="1" strokeDasharray="2 2" />
        {/* Red indicator arrows */}
        <circle cx="28" cy="42" r="2.5" fill="#EF4444" />
        <circle cx="68" cy="42" r="2.5" fill="#EF4444" />
        <path d="M24 42 L28 40 L28 44 Z" fill="#EF4444" />
        <path d="M72 42 L68 40 L68 44 Z" fill="#EF4444" />
      </svg>
    ),
  },

  lowerArm: {
    key: 'lowerArm',
    titleEn: 'Lower Arm (Forearm)',
    titleUr: 'بازو کا نچلا ناپ',
    guideEn: 'Measure around the widest part of the forearm below the elbow.',
    guideUr: 'کہنی سے نیچے بازو کے اگلے حصے کی گولائی کا ناپ لیں۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Forearm and Hand silhouette */}
        <path d="M34 10 L32 34 C32 46 36 62 42 78 L54 78 C58 62 62 46 62 34 L60 10 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Elbow crease line at top */}
        <path d="M38 18 Q47 24 56 18" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Measuring Tape Around Mid-Forearm (y ~ 46) */}
        <ellipse cx="47" cy="46" rx="17" ry="5.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <path d="M31 46 Q47 52 63 46" stroke="#78350F" strokeWidth="1" strokeDasharray="2 2" />
        {/* Red markers */}
        <circle cx="30" cy="46" r="2.5" fill="#EF4444" />
        <circle cx="64" cy="46" r="2.5" fill="#EF4444" />
        <path d="M26 46 L30 44 L30 48 Z" fill="#EF4444" />
        <path d="M68 46 L64 44 L64 48 Z" fill="#EF4444" />
      </svg>
    ),
  },

  wrist: {
    key: 'wrist',
    titleEn: 'Wrist',
    titleUr: 'کلائی کا ناپ',
    guideEn: 'Measure snugly around the wrist bone where the sleeve cuff sits.',
    guideUr: 'کلائی کی ہڈی کے گرد ناپیں جہاں قمیض کا کف بندھتا ہے۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Forearm down to wrist and hand */}
        <path d="M36 12 L38 52 C36 58 32 66 30 76 C28 86 36 90 42 90 L56 90 C62 90 68 84 66 76 C64 66 60 58 58 52 L60 12 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Wrist Bone prominence */}
        <circle cx="37" cy="54" r="2" fill="#94A3B8" />
        <circle cx="59" cy="54" r="2" fill="#94A3B8" />
        {/* Measuring Tape Around Wrist (y ~ 54) */}
        <ellipse cx="48" cy="54" rx="14" ry="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <path d="M34 54 Q48 59 62 54" stroke="#78350F" strokeWidth="1" strokeDasharray="1.5 1.5" />
        {/* Red arrows */}
        <circle cx="34" cy="54" r="2.5" fill="#EF4444" />
        <circle cx="62" cy="54" r="2.5" fill="#EF4444" />
        <path d="M30 54 L34 52 L34 56 Z" fill="#EF4444" />
        <path d="M66 54 L62 52 L62 56 Z" fill="#EF4444" />
      </svg>
    ),
  },

  cuff: {
    key: 'cuff',
    titleEn: 'Cuff',
    titleUr: 'آستین کُنّہ / کف',
    guideEn: 'Measure the circumference or flat width of the finished sleeve cuff opening.',
    guideUr: 'آستین کے تیار شدہ کف یا کھلے کُنّے کی چوڑائی یا گولائی کا ناپ۔',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="8" fill="#F8FAFC" />
        {/* Sleeve End with crisp tailored cuff */}
        <path d="M26 12 L30 54 L70 54 L74 12 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" strokeLinejoin="round" />
        {/* Cuff band rectangular cuff */}
        <path d="M28 54 L27 76 C27 80 30 82 34 82 L66 82 C70 82 73 80 73 76 L72 54 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        {/* Cuff button and buttonhole */}
        <circle cx="40" cy="68" r="3" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
        <line x1="58" y1="65" x2="58" y2="71" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        {/* Measuring Tape Across Cuff Opening (y ~ 86) */}
        <rect x="22" y="85" width="56" height="7" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="28" y1="85" x2="28" y2="88" stroke="#78350F" strokeWidth="1" />
        <line x1="36" y1="85" x2="36" y2="90" stroke="#78350F" strokeWidth="1" />
        <line x1="44" y1="85" x2="44" y2="88" stroke="#78350F" strokeWidth="1" />
        <line x1="50" y1="85" x2="50" y2="90" stroke="#78350F" strokeWidth="1" />
        <line x1="56" y1="85" x2="56" y2="88" stroke="#78350F" strokeWidth="1" />
        <line x1="64" y1="85" x2="64" y2="90" stroke="#78350F" strokeWidth="1" />
        <line x1="72" y1="85" x2="72" y2="88" stroke="#78350F" strokeWidth="1" />
        {/* Red arrows */}
        <path d="M18 88.5 L22 86 L22 91 Z" fill="#EF4444" />
        <path d="M82 88.5 L78 86 L78 91 Z" fill="#EF4444" />
      </svg>
    ),
  },
};
