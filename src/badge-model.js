import { getStateObject, formatEntityState } from "./entity-state.js";
import { shouldHideBadge } from "./badge-visibility.js";
import { getBadgeStyleVariables } from "./badge-styles.js";
import {
  normalizeTextValue,
  readBooleanValue,
  readValue,
} from "./value-helpers.js";

function createContext(config, hass, stateObject) {
  return { config, hass, stateObject };
}

function getPrimary(config, stateObject, read) {
  const value =
    config.primary ??
    config.name ??
    stateObject?.attributes?.friendly_name ??
    config.entity ??
    "";

  return read(value);
}

function getSecondary(config, hass, stateObject, read) {
  const value = config.secondary ?? config.label;

  if (value !== undefined) {
    return read(value);
  }

  return formatEntityState(config, hass, stateObject, read);
}

function getIcon(config, stateObject, read) {
  const value = config.icon ?? stateObject?.attributes?.icon ?? "";
  return read(value);
}

export function createBadgeModel(config, hass) {
  const stateObject = getStateObject(config, hass);
  const context = createContext(config, hass, stateObject);
  const read = (value) => readValue(value, context);

  if (shouldHideBadge(config, stateObject, context)) {
    return { hidden: true };
  }

  return {
    hidden: false,
    stateObject,
    primary: normalizeTextValue(getPrimary(config, stateObject, read)),
    secondary: normalizeTextValue(
      getSecondary(config, hass, stateObject, read),
    ),
    icon: normalizeTextValue(getIcon(config, stateObject, read)),
    showIcon: readBooleanValue(config.show_icon, true, context),
    showName: readBooleanValue(config.show_name, true, context),
    showLabel: readBooleanValue(config.show_label, true, context),
    styleVariables: getBadgeStyleVariables(config, context),
  };
}
