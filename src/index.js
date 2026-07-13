import { CustomJsBadge } from "./custom-js-badge.js";
import {
  CUSTOM_BADGE_NAME,
  CUSTOM_BADGE_TYPE,
  CUSTOM_BADGE_VERSION,
} from "./constants.js";
import { registerCustomBadge } from "./register.js";

if (!customElements.get(CUSTOM_BADGE_TYPE)) {
  customElements.define(CUSTOM_BADGE_TYPE, CustomJsBadge);
}

registerCustomBadge();
setTimeout(registerCustomBadge, 0);
setTimeout(registerCustomBadge, 1000);

console.info(
  `%c${CUSTOM_BADGE_NAME} ${CUSTOM_BADGE_VERSION}`,
  "color: var(--primary-color); font-weight: bold;",
);
