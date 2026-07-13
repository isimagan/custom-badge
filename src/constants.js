export const CUSTOM_BADGE_TYPE = "custom-js-badge";
export const CUSTOM_BADGE_NAME = "Custom Badge";
export const CUSTOM_BADGE_VERSION = "0.5.0";

export const TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;

export const DEFAULT_STYLES = Object.freeze({
  iconColor: "var(--state-icon-color)",
  backgroundColor: "var(--ha-card-background, var(--card-background-color))",
  borderColor: "var(--divider-color)",
  nameColor: "var(--secondary-text-color)",
  labelColor: "var(--primary-text-color)",
  height: "48px",
  borderRadius: "24px",
  padding: "0 16px 0 14px",
  gap: "10px",
  iconSize: "24px",
});
