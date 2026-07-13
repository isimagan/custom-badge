export const BADGE_STYLES = `
  :host {
    display: inline-block;
  }

  .badge {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--custom-js-badge-gap);
    min-height: var(--custom-js-badge-height);
    padding: var(--custom-js-badge-padding);
    border-radius: var(--custom-js-badge-border-radius);
    background: var(--custom-js-badge-background-color);
    color: var(--primary-text-color);
    border: 1px solid var(--custom-js-badge-border-color);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  ha-icon,
  ha-state-icon {
    --mdc-icon-size: var(--custom-js-badge-icon-size);
    color: var(--custom-js-badge-icon-color);
    flex: 0 0 auto;
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    line-height: 1.05;
  }

  .primary {
    color: var(--custom-js-badge-name-color);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.05;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .secondary,
  .only-secondary {
    color: var(--custom-js-badge-label-color);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.05;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
