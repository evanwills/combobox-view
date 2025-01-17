/**
 * Check whether a user instigated event can be assumed to be a
 * click event
 *
 * @param {Event} event User instigated event
 *
 * @returns TRUE if event is deemed to be a click event.
 *          FALSE otherwise
 */
// eslint-disable-next-line import/prefer-default-export
export const isClickEvent = (event) => {
  if (typeof event.key === 'string' && event.key !== '') {
    return (event.key === 'Enter' || event.key === 'Space');
  }

  return (event.type === 'click');
};

/**
 * Get a faux target DOM element as would be expected to be in an
 * InputEvent
 *
 * @param {any}    value      Value to be sent with faux input
 *                            elements
 * @param {any}    rawValue   Raw value (full option data) for
 *                            selected option to be sent with faux
 *                            input elements
 * @param {Object} validity   [{} (empty object)] Input validity props
 * @param {Object} otherProps [{} (empty object)] Any other props you
 *                            might want to add to the event target
 * @param {string} tag        ["input"] Tag name for the event target
 *
 * @returns {Object} Object that mimics an HTML
 *                   input/select/button/textarea field included as
 *                   the `target` property of an event
 */
const fauxEventTarget = (value, rawValue, validity = {}, otherProps = {}, tag = 'input') => {
  const TAG = tag.toLocaleUpperCase();

  return {
    validity: {
      badInput: false,
      customError: false,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooShort: false,
      typeMismatch: false,
      valid: true,
      valueMissing: false,
      ...validity,
    },
    ...otherProps,
    value,
    rawValue,
    localName: tag,
    nodeName: TAG,
    tagName: TAG,

    checkValidity() {
      for (const key of Object.keys(this.validity)) {
        const tmp = (key === 'valid')
          ? !this.validity[key]
          : this.validity[key];

        if (tmp === true) {
          return false;
        }
      }

      return true;
    },
  };
};

/**
 * Get a faux input event that can be passed up to parent listeners
 *
 * @param {any}    value      Value to be sent with faux input
 *                            elements
 * @param {any}    rawValue   Raw value (full option data) for
 *                            selected option to be sent with faux
 *                            input elements
 * @param {Object} validity   Input validity props
 * @param {Object} otherProps Any other props you might want to add
 *                            to the event target
 * @param {string} type       ["change"] Faux event type
 * @param {string} tag        ["input"] DOM element tag name
 *
 * @returns {Object} Object that mimics an InputEvent object emitted
 *                   from an HTML input/select/button/textarea field
 *                   after a user interaction.
 */
export const getFauxInputEvent = (
  value,
  rawValue = undefined,
  validity = {},
  otherProps = {},
  type = 'change',
  tag = 'input',
) => ({
  type,
  target: fauxEventTarget(
    value,
    (typeof rawValue !== 'undefined')
      ? rawValue
      : value,
    validity,
    otherProps,
    tag,
  ),
});
