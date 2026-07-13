import { readBooleanValue } from "./value-helpers.js";

export function shouldHideBadge(config, stateObject, context) {
  const entityConfigured = Boolean(config.entity);
  const entityMissing = entityConfigured && !stateObject;
  const entityUnavailable = stateObject?.state === "unavailable";
  const entityUnknown = stateObject?.state === "unknown";

  const hideIfMissing = readBooleanValue(
    config.hide_if_missing,
    false,
    context,
  );
  const hideIfUnavailable = readBooleanValue(
    config.hide_if_unavailable,
    false,
    context,
  );
  const hideIfUnknown = readBooleanValue(
    config.hide_if_unknown,
    false,
    context,
  );

  return (
    (entityMissing && hideIfMissing) ||
    (entityUnavailable && hideIfUnavailable) ||
    (entityUnknown && hideIfUnknown)
  );
}
