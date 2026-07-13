import {
  CUSTOM_BADGE_NAME,
  CUSTOM_BADGE_TYPE,
} from "./constants.js";

export function registerCustomBadge() {
  window.customBadges = window.customBadges || [];

  const definition = {
    type: CUSTOM_BADGE_TYPE,
    name: CUSTOM_BADGE_NAME,
    preview: false,
    description: "A customizable badge with JavaScript template support.",
  };

  const existingIndex = window.customBadges.findIndex(
    (badge) => badge.type === CUSTOM_BADGE_TYPE,
  );

  if (existingIndex >= 0) {
    window.customBadges[existingIndex] = definition;
  } else {
    window.customBadges.push(definition);
  }
}
