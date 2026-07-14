export function getStateObject(config, hass) {
  if (!config?.entity || !hass?.states) {
    return undefined;
  }

  return hass.states[config.entity];
}

export function formatEntityState(config, hass, stateObject) {
  if (!stateObject) {
    return config.entity ? "Entity not found" : "";
  }

  if (hass?.formatEntityState) {
    return hass.formatEntityState(stateObject);
  }

  const state = stateObject.state ?? "";
  const unit = stateObject.attributes?.unit_of_measurement;

  return unit ? `${state} ${unit}` : state;
}
