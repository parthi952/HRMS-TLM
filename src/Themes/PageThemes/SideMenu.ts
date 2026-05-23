/**
 * Centralized glassmorphic and colored theme utilities for HRMS layout menus and cards.
 * Provides consistent alpha-channel overlays and high-end backdrop blur filters.
 */

export interface GlassStyle {
  backgroundColor: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
}

/**
 * Returns premium glassmorphic styles with dynamic colored backdrops.
 * @param primaryHex The active theme hex color (e.g. #2563eb)
 * @param alphaOpacity The alpha hex code (e.g. "1A" for 10% opacity, "26" for 15%)
 * @param blurPx The backdrop blur radius in pixels (default 16px)
 */
export const getGlassmorphicStyle = (
  primaryHex: string, 
  alphaOpacity: string = "1A", 
  blurPx: number = 16
): GlassStyle => {
  return {
    backgroundColor: `${primaryHex}${alphaOpacity}`,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
  };
};
