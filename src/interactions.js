import { runConfiguredAction } from "./actions.js";

const HOLD_DELAY = 500;
const DOUBLE_TAP_DELAY = 250;

export class BadgeInteractions {
  constructor(host) {
    this.host = host;
    this.hass = undefined;
    this.config = {};
    this.holdTimer = undefined;
    this.tapTimer = undefined;
    this.holdTriggered = false;
  }

  update(hass, config) {
    this.hass = hass;
    this.config = config;
  }

  bind(badge) {
    badge.addEventListener("pointerdown", () => this.onPointerDown());
    badge.addEventListener("pointerup", () => this.onPointerUp());
    badge.addEventListener("pointerleave", () => this.onPointerUp());
    badge.addEventListener("pointercancel", () => this.onPointerUp());
    badge.addEventListener("click", (event) => this.onClick(event));
    badge.addEventListener("dblclick", (event) => this.onDoubleClick(event));
  }

  run(action) {
    void runConfiguredAction(
      this.host,
      this.hass,
      this.config,
      action,
    ).catch((error) => {
      console.error(`[custom-js-badge] ${action} action failed:`, error);
    });
  }

  onPointerDown() {
    clearTimeout(this.holdTimer);
    this.holdTriggered = false;

    this.holdTimer = setTimeout(() => {
      this.holdTriggered = true;
      this.run("hold");
    }, HOLD_DELAY);
  }

  onPointerUp() {
    clearTimeout(this.holdTimer);
  }

  onClick(event) {
    if (this.holdTriggered) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    clearTimeout(this.tapTimer);
    this.tapTimer = setTimeout(() => this.run("tap"), DOUBLE_TAP_DELAY);
  }

  onDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this.tapTimer);
    this.run("double_tap");
  }
}
