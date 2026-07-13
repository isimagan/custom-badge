import { DEFAULT_STYLES } from "./constants.js";
import { readStyleValue } from "./value-helpers.js";

export function getBadgeStyleVariables(config, context) {
  return {
    "--custom-js-badge-icon-color": readStyleValue(
      config.icon_color ?? config.color,
      DEFAULT_STYLES.iconColor,
      context,
    ),
    "--custom-js-badge-background-color": readStyleValue(
      config.background_color,
      DEFAULT_STYLES.backgroundColor,
      context,
    ),
    "--custom-js-badge-border-color": readStyleValue(
      config.border_color,
      DEFAULT_STYLES.borderColor,
      context,
    ),
    "--custom-js-badge-name-color": readStyleValue(
      config.name_color ?? config.primary_color,
      DEFAULT_STYLES.nameColor,
      context,
    ),
    "--custom-js-badge-label-color": readStyleValue(
      config.label_color ?? config.secondary_color,
      DEFAULT_STYLES.labelColor,
      context,
    ),
    "--custom-js-badge-height": readStyleValue(
      config.height,
      DEFAULT_STYLES.height,
      context,
    ),
    "--custom-js-badge-border-radius": readStyleValue(
      config.border_radius,
      DEFAULT_STYLES.borderRadius,
      context,
    ),
    "--custom-js-badge-padding": readStyleValue(
      config.padding,
      DEFAULT_STYLES.padding,
      context,
    ),
    "--custom-js-badge-gap": readStyleValue(
      config.gap,
      DEFAULT_STYLES.gap,
      context,
    ),
    "--custom-js-badge-icon-size": readStyleValue(
      config.icon_size,
      DEFAULT_STYLES.iconSize,
      context,
    ),
  };
}

export function applyBadgeStyles(badge, styleVariables) {
  for (const [property, value] of Object.entries(styleVariables)) {
    badge.style.setProperty(property, value);
  }
}
