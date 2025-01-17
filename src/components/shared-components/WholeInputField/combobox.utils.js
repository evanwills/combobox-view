import { isObj, isStrNum, nullStr } from '../../../utils/data-utils';
import { getNormaliseSingleOption } from './radio-select.utils';

/**
 * Get the data required to emit a combobox event.
 *
 * @param {Array}  _options list of options
 * @param {number} _index   index of the currently selected option
 * @param {string} _str     combobox input balue
 *
 * @returns {object}
 */
export const getEmitData = (_options, _index, _str) => {
  const empty = (_options.length === 0);
  const rawOutput = (empty === false && _index !== null && isObj(_options[_index]))
    ? { ..._options[_index] }
    : null;
  const validity = { valid: true, badInput: false, valueMissing: false };
  const bad = (rawOutput === null);
  let output = '';

  if (bad === true) {
    validity.valid = false;
    validity.badInput = (_str.trim() === '' || empty === true);
    validity.valueMissing = true;
  } else {
    output = rawOutput.value;
  }

  return {
    output,
    validity,
    empty,
    rawOutput,
    bad,
  };
};

export const defaultFilter = (optionList, value, options) => {
  if (optionList.length > 0 && typeof value === 'string') {
    const val = value.trim().toLocaleLowerCase();

    if (val !== '') {
      return optionList.filter((item) => (
        item.value.toLocaleLowerCase().includes(val)
        || (typeof item.label)
      ));
    }
  }

  return options;
};

/**
 * Get a function that returns a function that can be passed to
 * Array.map()
 *
 * @param {Function} func Item normaliser function
 *
 * @returns {Function} A function that wraps the supplied function
 *                     to get combobox suitable objects from an
 *                     Array.map() call.
 */
export const getOptionItem = (func) => (item) => {
  if (isStrNum(item) === true) {
    const tmp = nullStr(item);

    return {
      value: tmp,
      label: tmp,
      default: tmp,
      icon: '',
    };
  }

  if (isObj(item)) {
    const _item = func({
      ...item,
      icon: (typeof item.icon !== 'undefined')
        ? nullStr(item.icon)
        : '',
    });

    if (_item.value === '' || _item.label === '') {
      throw new Error(
        'getOptionItem() could not find a property name for either '
        + 'value or label',
      );
    }

    return _item;
  }

  throw new Error(
    'getOptionItem()  expects each item to be a string, number or '
    + `object. Received ${typeof item}`,
  );
};

export const getRawOptions = (optionlist) => optionlist.map(
  getOptionItem(
    getNormaliseSingleOption('', true),
  ),
);

export const isPrintableCharacter = (str) => ((str.length === 1 && str.match(/\S| /))
  || ['Backspace', 'Delete'].includes(str));
