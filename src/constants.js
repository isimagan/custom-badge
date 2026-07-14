export const CUSTOM_BADGE_TYPE = "custom-js-badge";
export const CUSTOM_BADGE_NAME = "Custom Badge";
export const CUSTOM_BADGE_VERSION = "0.5.0";

export const TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;

export const DEFAULT_STYLES = Object.freeze({
  iconColor: "var(--state-icon-color)",
  backgroundColor:
    "var(--ha-card-background, var(--card-background-color, white))",
  primaryColor: "var(--primary-text-color)",
  secondaryColor: "var(--secondary-text-color)",
});
