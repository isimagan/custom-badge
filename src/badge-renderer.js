import { applyBadgeStyles } from "./badge-styles.js";
import { BADGE_STYLES } from "./styles.js";
import { escapeHtml } from "./value-helpers.js";

function createTextMarkup(model) {
  const primaryMarkup =
    model.showName && model.primary
      ? `<div class="primary">${escapeHtml(model.primary)}</div>`
      : "";

  const secondaryClass =
    model.showName && model.primary ? "secondary" : "only-secondary";
  const secondaryMarkup =
    model.showLabel && model.secondary
      ? `<div class="${secondaryClass}">${escapeHtml(model.secondary)}</div>`
      : "";

  return `${primaryMarkup}${secondaryMarkup}`;
}

function appendIcon(iconContainer, model, hass) {
  if (model.icon) {
    const iconElement = document.createElement("ha-icon");
    iconElement.setAttribute("icon", model.icon);
    iconContainer.appendChild(iconElement);
    return;
  }

  if (model.stateObject) {
    const stateIconElement = document.createElement("ha-state-icon");
    stateIconElement.hass = hass;
    stateIconElement.stateObj = model.stateObject;
    iconContainer.appendChild(stateIconElement);
    return;
  }

  iconContainer.remove();
}

export function clearBadge(shadowRoot) {
  shadowRoot.innerHTML = "";
}

export function renderBadge(shadowRoot, model, hass) {
  shadowRoot.innerHTML = `
    <style>${BADGE_STYLES}</style>
    <div class="badge">
      <span class="icon-container"></span>
      <div class="text">${createTextMarkup(model)}</div>
    </div>
  `;

  const badge = shadowRoot.querySelector(".badge");
  if (!badge) {
    return undefined;
  }

  applyBadgeStyles(badge, model.styleVariables);

  const iconContainer = shadowRoot.querySelector(".icon-container");
  if (!iconContainer) {
    return badge;
  }

  if (!model.showIcon) {
    iconContainer.remove();
    return badge;
  }

  appendIcon(iconContainer, model, hass);
  return badge;
}
