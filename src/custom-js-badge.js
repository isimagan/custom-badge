import { DEFAULT_STYLES } from "./constants.js";
import { runConfiguredAction } from "./actions.js";
import { BADGE_STYLES } from "./styles.js";
import {
  escapeHtml,
  getStateObject,
  normalizeTextValue,
  readBooleanValue,
  readStyleValue,
  readValue,
} from "./value-helpers.js";

export class CustomJsBadge extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = undefined;
    this._holdTimer = undefined;
    this._tapTimer = undefined;
    this._holdTriggered = false;
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Custom Badge requires a configuration object.");
    }

    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _getStateObject() {
    return getStateObject(this._config, this._hass);
  }

  _getValueContext(stateObject = this._getStateObject()) {
    return {
      config: this._config,
      hass: this._hass,
      stateObject,
    };
  }

  _readValue(value, stateObject) {
    return readValue(value, this._getValueContext(stateObject));
  }

  _readStyleValue(value, fallback, stateObject) {
    return readStyleValue(
      value,
      fallback,
      this._getValueContext(stateObject),
    );
  }

  _readBooleanValue(value, fallback, stateObject) {
    return readBooleanValue(
      value,
      fallback,
      this._getValueContext(stateObject),
    );
  }

  _onPointerDown() {
    clearTimeout(this._holdTimer);
    this._holdTriggered = false;

    this._holdTimer = setTimeout(() => {
      this._holdTriggered = true;
      void runConfiguredAction(
        this,
        this._hass,
        this._config,
        "hold",
      ).catch((error) => {
        console.error("[custom-js-badge] Hold action failed:", error);
      });
    }, 500);
  }

  _onPointerUp() {
    clearTimeout(this._holdTimer);
  }

  _onClick(event) {
    if (this._holdTriggered) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    clearTimeout(this._tapTimer);
    this._tapTimer = setTimeout(() => {
      void runConfiguredAction(
        this,
        this._hass,
        this._config,
        "tap",
      ).catch((error) => {
        console.error("[custom-js-badge] Tap action failed:", error);
      });
    }, 250);
  }

  _onDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this._tapTimer);

    void runConfiguredAction(
      this,
      this._hass,
      this._config,
      "double_tap",
    ).catch((error) => {
      console.error("[custom-js-badge] Double-tap action failed:", error);
    });
  }

  _getPrimary(stateObject) {
    const value =
      this._config.primary ??
      this._config.name ??
      stateObject?.attributes?.friendly_name ??
      this._config.entity ??
      "";

    return this._readValue(value, stateObject);
  }

  _formatState(stateObject) {
    if (!stateObject) {
      return this._readValue(
        this._config.missing_entity_label ?? "",
        stateObject,
      );
    }

    if (stateObject.state === "unavailable") {
      return this._readValue(
        this._config.unavailable_label ?? "Unavailable",
        stateObject,
      );
    }

    if (stateObject.state === "unknown") {
      return this._readValue(
        this._config.unknown_label ?? "Unknown",
        stateObject,
      );
    }

    if (this._hass?.formatEntityState) {
      return this._hass.formatEntityState(stateObject);
    }

    const state = stateObject.state ?? "";
    const unit = stateObject.attributes?.unit_of_measurement;

    if (unit) {
      return `${state} ${unit}`;
    }

    if (stateObject.attributes?.device_class === "battery") {
      return `${state} %`;
    }

    return state;
  }

  _getSecondary(stateObject) {
    const value = this._config.secondary ?? this._config.label;

    if (value !== undefined) {
      return this._readValue(value, stateObject);
    }

    return this._formatState(stateObject);
  }

  _getIcon(stateObject) {
    const value = this._config.icon ?? stateObject?.attributes?.icon ?? "";
    return this._readValue(value, stateObject);
  }

  _setBadgeStyles(badge, values) {
    for (const [property, value] of Object.entries(values)) {
      badge.style.setProperty(property, value);
    }
  }

  _appendIcon(iconContainer, icon, stateObject) {
    if (icon) {
      const iconElement = document.createElement("ha-icon");
      iconElement.setAttribute("icon", icon);
      iconContainer.appendChild(iconElement);
      return;
    }

    if (stateObject) {
      const stateIconElement = document.createElement("ha-state-icon");
      stateIconElement.hass = this._hass;
      stateIconElement.stateObj = stateObject;
      iconContainer.appendChild(stateIconElement);
      return;
    }

    iconContainer.remove();
  }

  _render() {
    if (!this.shadowRoot) {
      return;
    }

    const stateObject = this._getStateObject();
    const entityConfigured = Boolean(this._config.entity);
    const entityMissing = entityConfigured && !stateObject;
    const entityUnavailable = stateObject?.state === "unavailable";
    const entityUnknown = stateObject?.state === "unknown";

    const hideIfMissing = this._readBooleanValue(
      this._config.hide_if_missing,
      false,
      stateObject,
    );
    const hideIfUnavailable = this._readBooleanValue(
      this._config.hide_if_unavailable,
      false,
      stateObject,
    );
    const hideIfUnknown = this._readBooleanValue(
      this._config.hide_if_unknown,
      false,
      stateObject,
    );

    if (
      (entityMissing && hideIfMissing) ||
      (entityUnavailable && hideIfUnavailable) ||
      (entityUnknown && hideIfUnknown)
    ) {
      this.shadowRoot.innerHTML = "";
      return;
    }

    const primary = normalizeTextValue(this._getPrimary(stateObject));
    const secondary = normalizeTextValue(this._getSecondary(stateObject));
    const icon = normalizeTextValue(this._getIcon(stateObject));

    const showIcon = this._readBooleanValue(
      this._config.show_icon,
      true,
      stateObject,
    );
    const showName = this._readBooleanValue(
      this._config.show_name,
      true,
      stateObject,
    );
    const showLabel = this._readBooleanValue(
      this._config.show_label,
      true,
      stateObject,
    );

    this.shadowRoot.innerHTML = `
      <style>${BADGE_STYLES}</style>
      <div class="badge">
        <span class="icon-container"></span>
        <div class="text">
          ${
            showName && primary
              ? `<div class="primary">${escapeHtml(primary)}</div>`
              : ""
          }
          ${
            showLabel && secondary
              ? `<div class="${
                  showName && primary ? "secondary" : "only-secondary"
                }">${escapeHtml(secondary)}</div>`
              : ""
          }
        </div>
      </div>
    `;

    const badge = this.shadowRoot.querySelector(".badge");
    if (!badge) {
      return;
    }

    this._setBadgeStyles(badge, {
      "--custom-js-badge-icon-color": this._readStyleValue(
        this._config.icon_color ?? this._config.color,
        DEFAULT_STYLES.iconColor,
        stateObject,
      ),
      "--custom-js-badge-background-color": this._readStyleValue(
        this._config.background_color,
        DEFAULT_STYLES.backgroundColor,
        stateObject,
      ),
      "--custom-js-badge-border-color": this._readStyleValue(
        this._config.border_color,
        DEFAULT_STYLES.borderColor,
        stateObject,
      ),
      "--custom-js-badge-name-color": this._readStyleValue(
        this._config.name_color ?? this._config.primary_color,
        DEFAULT_STYLES.nameColor,
        stateObject,
      ),
      "--custom-js-badge-label-color": this._readStyleValue(
        this._config.label_color ?? this._config.secondary_color,
        DEFAULT_STYLES.labelColor,
        stateObject,
      ),
      "--custom-js-badge-height": this._readStyleValue(
        this._config.height,
        DEFAULT_STYLES.height,
        stateObject,
      ),
      "--custom-js-badge-border-radius": this._readStyleValue(
        this._config.border_radius,
        DEFAULT_STYLES.borderRadius,
        stateObject,
      ),
      "--custom-js-badge-padding": this._readStyleValue(
        this._config.padding,
        DEFAULT_STYLES.padding,
        stateObject,
      ),
      "--custom-js-badge-gap": this._readStyleValue(
        this._config.gap,
        DEFAULT_STYLES.gap,
        stateObject,
      ),
      "--custom-js-badge-icon-size": this._readStyleValue(
        this._config.icon_size,
        DEFAULT_STYLES.iconSize,
        stateObject,
      ),
    });

    badge.addEventListener("pointerdown", () => this._onPointerDown());
    badge.addEventListener("pointerup", () => this._onPointerUp());
    badge.addEventListener("pointerleave", () => this._onPointerUp());
    badge.addEventListener("pointercancel", () => this._onPointerUp());
    badge.addEventListener("click", (event) => this._onClick(event));
    badge.addEventListener("dblclick", (event) => this._onDoubleClick(event));

    const iconContainer = this.shadowRoot.querySelector(".icon-container");
    if (!iconContainer) {
      return;
    }

    if (!showIcon) {
      iconContainer.remove();
      return;
    }

    this._appendIcon(iconContainer, icon, stateObject);
  }

  static getStubConfig() {
    return {
      entity: "sun.sun",
    };
  }
}
