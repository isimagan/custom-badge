import { applyBadgeStyles } from "./badge-styles.js";
import { BADGE_STYLES } from "./styles.js";
import { escapeHtml } from "./value-helpers.js";

function createTextMarkup(model) {
  const secondaryMarkup =
    model.showSecondary && model.secondary
      ? `<span class="label">${escapeHtml(model.secondary)}</span>`
      : "";

  const primaryMarkup =
    model.showPrimary && model.primary
      ? `<span class="content">${escapeHtml(model.primary)}</span>`
      : "";

  if (!secondaryMarkup && !primaryMarkup) {
    return "";
  }

  return `<span class="info">${secondaryMarkup}${primaryMarkup}</span>`;
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

export function renderBadge(shadowRoot, model, hass) {
  shadowRoot.innerHTML = `
    <style>${BADGE_STYLES}</style>
    <div class="badge">
      <span class="icon"></span>
      ${createTextMarkup(model)}
    </div>
  `;

  const badge = shadowRoot.querySelector(".badge");
  if (!badge) {
    return undefined;
  }

  applyBadgeStyles(badge, model.styleVariables);

  const iconContainer = shadowRoot.querySelector(".icon");
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
