const ACTION_PROPERTY = Object.freeze({
  tap: "tap_action",
  hold: "hold_action",
  double_tap: "double_tap_action",
});

function defaultAction(action, hasEntity) {
  if (action === "tap") {
    return { action: hasEntity ? "more-info" : "none" };
  }

  return { action: "none" };
}

export function getActionConfig(config = {}) {
  const hasEntity = Boolean(config.entity);

  return {
    ...config,
    tap_action: config.tap_action ?? defaultAction("tap", hasEntity),
    hold_action: config.hold_action ?? defaultAction("hold", hasEntity),
    double_tap_action:
      config.double_tap_action ?? defaultAction("double_tap", hasEntity),
  };
}

function fireHassAction(host, config, action) {
  const event = new Event("hass-action", {
    bubbles: true,
    composed: true,
  });

  event.detail = { config, action };
  host.dispatchEvent(event);
}

function parseDelay(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(ms|s)?$/);
  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  return match[2] === "s" ? amount * 1000 : amount;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getServiceName(actionConfig) {
  return actionConfig.perform_action ?? actionConfig.service;
}

function isServiceAction(actionConfig) {
  return ["perform-action", "call-service", "call_service"].includes(
    actionConfig?.action,
  );
}

async function runServiceAction(hass, actionConfig) {
  const serviceName = getServiceName(actionConfig);
  if (!serviceName || !hass?.callService) {
    console.warn("[custom-js-badge] Invalid service action:", actionConfig);
    return;
  }

  const separator = serviceName.indexOf(".");
  if (separator < 1 || separator === serviceName.length - 1) {
    console.warn("[custom-js-badge] Invalid service name:", serviceName);
    return;
  }

  const domain = serviceName.slice(0, separator);
  const service = serviceName.slice(separator + 1);
  const data = actionConfig.data ?? actionConfig.service_data ?? {};
  const target = actionConfig.target;

  await hass.callService(domain, service, data, target);
}

function isMultiAction(actionConfig) {
  return ["multi-action", "multi-actions"].includes(actionConfig?.action);
}

async function runActionStep(host, hass, baseConfig, actionConfig) {
  if (!actionConfig || actionConfig.action === "none") {
    return;
  }

  if (Object.hasOwn(actionConfig, "delay")) {
    await delay(parseDelay(actionConfig.delay));
    return;
  }

  if (isMultiAction(actionConfig)) {
    await runMultiAction(host, hass, baseConfig, actionConfig);
    return;
  }

  if (isServiceAction(actionConfig)) {
    await runServiceAction(hass, actionConfig);
    return;
  }

  fireHassAction(
    host,
    {
      ...baseConfig,
      tap_action: actionConfig,
    },
    "tap",
  );
}

async function runMultiAction(host, hass, baseConfig, actionConfig) {
  const sequence = actionConfig.actions ?? actionConfig.sequence ?? [];

  if (!Array.isArray(sequence)) {
    console.warn("[custom-js-badge] Multi-action sequence must be an array.");
    return;
  }

  for (const step of sequence) {
    await runActionStep(host, hass, baseConfig, step);
  }
}

export async function runConfiguredAction(host, hass, config, action) {
  const actionProperty = ACTION_PROPERTY[action];
  if (!actionProperty) {
    return;
  }

  const actionConfig = getActionConfig(config);
  const configuredAction = actionConfig[actionProperty];

  if (isMultiAction(configuredAction)) {
    await runMultiAction(host, hass, actionConfig, configuredAction);
    return;
  }

  fireHassAction(host, actionConfig, action);
}
