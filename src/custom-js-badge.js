import { createBadgeModel } from "./badge-model.js";
import { clearBadge, renderBadge } from "./badge-renderer.js";
import { BadgeInteractions } from "./interactions.js";

export class CustomJsBadge extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = undefined;
    this._interactions = new BadgeInteractions(this);
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

  _render() {
    if (!this.shadowRoot) {
      return;
    }

    const model = createBadgeModel(this._config, this._hass);

    if (model.hidden) {
      clearBadge(this.shadowRoot);
      return;
    }

    const badge = renderBadge(this.shadowRoot, model, this._hass);
    if (!badge) {
      return;
    }

    this._interactions.update(this._hass, this._config);
    this._interactions.bind(badge);
  }

  static getStubConfig() {
    return {
      entity: "sun.sun",
    };
  }
}
