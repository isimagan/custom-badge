export function getStateObject(config, hass) {
  if (!config?.entity || !hass?.states) {
    return undefined;
  }

  return hass.states[config.entity];
}

export function formatEntityState(config, hass, stateObject, readValue) {
  if (!stateObject) {
    return readValue(config.missing_entity_label ?? "");
  }

  if (stateObject.state === "unavailable") {
    return readValue(config.unavailable_label ?? "Unavailable");
  }

  if (stateObject.state === "unknown") {
    return readValue(config.unknown_label ?? "Unknown");
  }

  if (hass?.formatEntityState) {
    return hass.formatEntityState(stateObject);
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
