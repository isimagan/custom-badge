import { TEMPLATE_REGEX } from "./constants.js";

export function getStateObject(config, hass) {
  if (!config?.entity || !hass?.states) {
    return undefined;
  }

  return hass.states[config.entity];
}

function createTemplateHelpers(states) {
  return {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId]),
  };
}

export function readValue(value, { config, hass, stateObject }) {
  if (typeof value !== "string") {
    return value;
  }

  const match = value.match(TEMPLATE_REGEX);
  if (!match) {
    return value;
  }

  const states = hass?.states ?? {};
  const helpers = createTemplateHelpers(states);

  try {
    return Function(
      "hass",
      "entity",
      "states",
      "config",
      "user",
      "helpers",
      `"use strict";\n${match[1]}`,
    )(hass, stateObject, states, config, hass?.user, helpers);
  } catch (error) {
    console.error("[custom-js-badge] Template error:", error, value);
    return config?.template_error_label ?? "Template error";
  }
}

export function readStyleValue(value, fallback, context) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return readValue(value, context);
}

export function readBooleanValue(value, fallback, context) {
  if (value === undefined || value === null) {
    return fallback;
  }

  const evaluated = readValue(value, context);

  if (typeof evaluated === "boolean") {
    return evaluated;
  }

  if (typeof evaluated === "string") {
    return evaluated.toLowerCase() !== "false";
  }

  return Boolean(evaluated);
}

export function normalizeTextValue(value) {
  if (value === undefined || value === null || value === false) {
    return "";
  }

  return String(value);
}

export function escapeHtml(value) {
  return normalizeTextValue(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
