import { TEMPLATE_REGEX } from "./constants.js";

function createTemplateHelpers(states) {
  return {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId]),
  };
}

export function evaluateTemplate(value, { config, hass, stateObject }) {
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
    return "Template error";
  }
}
