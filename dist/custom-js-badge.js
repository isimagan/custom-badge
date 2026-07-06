const CUSTOM_JS_BADGE_VERSION = "0.1.0";

class CustomJsBadge extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this._config = {};
    this._hass = undefined;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          min-height: 36px;
          padding: 0 12px;
          border-radius: 18px;
          background: var(--ha-card-background, var(--card-background-color));
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
          font-size: 12px;
          font-weight: 500;
        }
      </style>

      <div class="badge">
        Custom JS Badge loaded
      </div>
    `;
  }

  static getStubConfig() {
    return {};
  }
}

customElements.define("custom-js-badge", CustomJsBadge);

window.customBadges = window.customBadges || [];
window.customBadges.push({
  type: "custom-js-badge",
  name: "Custom JS Badge",
  preview: false,
  description: "A customizable badge with JavaScript template support.",
});

console.info(
  `%cCUSTOM-JS-BADGE ${CUSTOM_JS_BADGE_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);
