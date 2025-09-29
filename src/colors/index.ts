/**
 * Color manipulation utilities
 */

import { isValidHex } from '../validation';

/**
 * Normalizes hex color to 6-digit format with # prefix
 * @param hex - The hex color string
 * @returns Normalized hex color
 */
const normalizeHex = (hex: string): string => {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  return `#${hex.toUpperCase()}`;
};

/**
 * Clamps a number between 0 and 255
 * @param value - The value to clamp
 * @returns Clamped value
 */
const clamp = (value: number): number => Math.max(0, Math.min(255, value));

/**
 * Lightens a hex color by a given percentage
 * @param hex - The hex color to lighten (e.g., '#207dd3' or '207dd3')
 * @param percent - The percentage to lighten (0-100)
 * @returns The lightened hex color
 * @throws {Error} If hex color is invalid
 */
export const lightenColor = (hex: string, percent: number): string => {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);
  const amt = Math.round(2.55 * percent);

  const R = clamp((num >> 16) + amt);
  const G = clamp(((num >> 8) & 0x00ff) + amt);
  const B = clamp((num & 0x0000ff) + amt);

  return `#${(
    0x1000000 +
    R * 0x10000 +
    G * 0x100 +
    B
  ).toString(16).slice(1).toUpperCase()}`;
};

/**
 * Darkens a hex color by a given percentage
 * @param hex - The hex color to darken (e.g., '#207dd3' or '207dd3')
 * @param percent - The percentage to darken (0-100)
 * @returns The darkened hex color
 * @throws {Error} If hex color is invalid
 */
export const darkenColor = (hex: string, percent: number): string => {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);
  const amt = Math.round(2.55 * percent);

  const R = clamp((num >> 16) - amt);
  const G = clamp(((num >> 8) & 0x00ff) - amt);
  const B = clamp((num & 0x0000ff) - amt);

  return `#${(
    0x1000000 +
    R * 0x10000 +
    G * 0x100 +
    B
  ).toString(16).slice(1).toUpperCase()}`;
};

/**
 * Converts hex color to RGB object
 * @param hex - The hex color to convert
 * @returns RGB object with r, g, b properties (0-255)
 * @throws {Error} If hex color is invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);

  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff
  };
};

/**
 * Converts RGB values to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const R = clamp(Math.round(r));
  const G = clamp(Math.round(g));
  const B = clamp(Math.round(b));

  return `#${(
    0x1000000 +
    R * 0x10000 +
    G * 0x100 +
    B
  ).toString(16).slice(1).toUpperCase()}`;
};

/**
 * Converts hex color to RGB string
 * @param hex - The hex color to convert
 * @returns RGB string in format 'rgb(r, g, b)'
 * @throws {Error} If hex color is invalid
 */
export const hexToRgbString = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Parses RGB string to RGB object
 * @param rgb - RGB string (e.g., 'rgb(255, 0, 0)' or 'rgba(255, 0, 0, 1)')
 * @returns RGB object with r, g, b properties
 */
export const parseRgb = (rgb: string): { r: number; g: number; b: number } | null => {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);

  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
};

/**
 * Gets the luminance of a color (0-1, where 0 is darkest)
 * @param hex - The hex color
 * @returns Luminance value (0-1)
 * @throws {Error} If hex color is invalid
 */
export const getLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);

  const [R, G, B] = [r, g, b].map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Determines if a color is light or dark
 * @param hex - The hex color
 * @param threshold - Luminance threshold (default: 0.5)
 * @returns True if color is light
 * @throws {Error} If hex color is invalid
 */
export const isLightColor = (hex: string, threshold: number = 0.5): boolean => {
  return getLuminance(hex) > threshold;
};

/**
 * Gets contrasting text color (black or white) for a background color
 * @param hex - The background hex color
 * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 * @throws {Error} If hex color is invalid
 */
export const getContrastText = (hex: string): string => {
  return isLightColor(hex) ? '#000000' : '#FFFFFF';
};