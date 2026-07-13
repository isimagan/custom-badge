import { evaluateTemplate } from "./template.js";

export function readValue(value, context) {
  return evaluateTemplate(value, context);
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
