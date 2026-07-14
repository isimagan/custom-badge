export const BADGE_STYLES = `
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  .badge {
    --badge-color: var(--custom-js-badge-icon-color);
    --ha-ripple-color: var(--badge-color);
    --ha-ripple-hover-opacity: 0.04;
    --ha-ripple-pressed-opacity: 0.12;
    justify-content: center;
    align-items: center;
    gap: var(--ha-space-2);
    height: var(--ha-badge-size, 36px);
    min-width: var(--ha-badge-size, 36px);
    box-sizing: border-box;
    border-radius: var(
      --ha-badge-border-radius,
      calc(var(--ha-badge-size, 36px) / 2)
    );
    background: var(--custom-js-badge-background-color);
    width: auto;
    backdrop-filter: var(--ha-card-backdrop-filter, none);
    border-width: var(--ha-card-border-width, 1px);
    box-shadow: var(--ha-card-box-shadow, none);
    border-style: solid;
    border-color: var(
      --ha-card-border-color,
      var(--divider-color, #e0e0e0)
    );
    flex-direction: row;
    padding: 0 12px;
    transition:
      box-shadow 0.18s ease-in-out,
      border-color 0.18s ease-in-out;
    display: flex;
    position: relative;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .info {
    text-align: center;
    flex-direction: column;
    align-items: flex-start;
    padding-inline-start: initial;
    display: flex;
    min-width: 0;
  }

  .label {
    font-size: var(--ha-font-size-xs);
    font-style: normal;
    font-weight: var(--ha-font-weight-medium);
    letter-spacing: 0.1px;
    color: var(--custom-js-badge-secondary-color);
    line-height: 10px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content {
    font-size: var(--ha-badge-font-size, var(--ha-font-size-s));
    font-style: normal;
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
    letter-spacing: 0.1px;
    color: var(--custom-js-badge-primary-color);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin-left: -4px;
    margin-right: 0;
    margin-inline: -4px 0;
    line-height: 0;
  }

  ha-icon,
  ha-state-icon {
    --mdc-icon-size: var(--ha-badge-icon-size, 18px);
    color: var(--badge-color);
  }
`;
