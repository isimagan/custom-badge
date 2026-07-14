import { formatEntityState, getStateObject } from "./entity-state.js";
import { getBadgeStyleVariables } from "./badge-styles.js";
import {
  normalizeTextValue,
  readBooleanValue,
  readValue,
} from "./value-helpers.js";

function createContext(config, hass, stateObject) {
  return { config, hass, stateObject };
}

function getPrimary(config, hass, stateObject, read) {
  const value = config.primary ?? config.label;

  if (value !== undefined) {
    return read(value);
  }

  return formatEntityState(config, hass, stateObject);
}

function getSecondary(config, stateObject, read) {
  const value =
    config.secondary ??
    config.name ??
    stateObject?.attributes?.friendly_name ??
    config.entity ??
    "";

  return read(value);
}

function getIcon(config, stateObject, read) {
  const value = config.icon ?? stateObject?.attributes?.icon ?? "";
  return read(value);
}

export function createBadgeModel(config, hass) {
  const stateObject = getStateObject(config, hass);
  const context = createContext(config, hass, stateObject);
  const read = (value) => readValue(value, context);

  return {
    stateObject,
    primary: normalizeTextValue(
      getPrimary(config, hass, stateObject, read),
    ),
    secondary: normalizeTextValue(getSecondary(config, stateObject, read)),
    icon: normalizeTextValue(getIcon(config, stateObject, read)),
    showIcon: readBooleanValue(config.show_icon, true, context),
    showPrimary: readBooleanValue(
      config.show_primary ?? config.show_label,
      true,
      context,
    ),
    showSecondary: readBooleanValue(
      config.show_secondary ?? config.show_name,
      true,
      context,
    ),
    styleVariables: getBadgeStyleVariables(config, context),
  };
}
