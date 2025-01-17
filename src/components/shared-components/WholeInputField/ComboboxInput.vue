<template>
  <div
    class="relative w-full max-w-md"
    ref="comboboxWrap"
    v-on:keyup="handleInputKeyUp">
    <div class="group">
      <input
        :aria-activedescendant="activeID"
        :aria-autocomplete="autoComplete"
        :aria-expanded="showList"
        :aria-controls="getID('listbox')"
        :class="inputClass"
        :data-value="activeVal"
        :id="id"
        :placeholder="getPlaceHolder"
        ref="comboboxInput"
        role="combobox"
        type="text"
        v-on:focus="handleInputFocus" />
    </div>
    <ul
      v-if="showList"
      :aria-label="label"
      :class="comboListClass"
      :id="getID('listbox')"
      role="listbox"
      ref="comboboxList"
      tabindex="0"
      v-on:keyup="handleOptionKeyUp"
      v-on:click="handleOptionClick">
      <ComboboxItem
        v-for="(option, index) in options"
        :focused="selectedIndex === index"
        :icon="option.icon"
        :icon-last="iconLast"
        :id="getID('item')"
        :index="index"
        :key="option.value"
        :label="option.label"
        :raw-option="option"
        :selected="selectedIndex === index"
        :value="option.value"
        :wrap="wrap" />
    </ul>
  </div>
</template>
<script setup>
/**
 * Much of this code was taken from
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/#ex_label
 * and the CodePen example linked from within the above page
 */
import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import ComboboxItem from './ComboboxItem.vue';
import { isObj } from '../../../utils/data-utils';
import { getEpre } from '../../../utils/general-utils';
import { getFauxInputEvent } from '../../../utils/event.utils';
import {
  defaultFilter,
  getEmitData,
  getRawOptions,
  isPrintableCharacter,
} from './combobox.utils';

// --------------------------------------------------
// START: Vue 3 utilities

const emit = defineEmits(['change', 'invalid']);

//  END:  Vue 3 utilities
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * WAI ARIA Autocomplete mode
   *
   * > __Note:__ At the moment this is ignored and `list` is always
   * >           used
   *
   * See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-autocomplete
   * and https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
   *
   * Options are:
   * * `list`  -  [default] aria-autocomplete="list" When a user is
   *              providing input, an element containing a collection
   *              of values that could complete the provided input
   *              may be displayed.
   * * `none`  -  When a user is providing input, no automatic
   *              suggestion is displayed.
   * * `inline` - aria-autocomplete="inline" text suggesting one way
   *              to complete the provided input may be dynamically
   *              inserted after the caret.
   * * `both`  -  aria-autocomplete="both" an input to offer both
   *              models at the same time. When a user is providing
   *              input, an element containing a collection of values
   *              that could complete the provided input may be
   *              displayed. If displayed, one value in the
   *              collection is automatically selected, and the text
   *              needed to complete the automatically selected value
   *              appears after the caret in the input.
   *
   * @property {string} autoComplete ["list"]
   */
  autoComplete: { type: String, required: false, default: 'list' },

  /**
   * Whether or not to emit a change event when the user input text
   * exactly matches a single option
   *
   * @property {boolean} autoSelect [false]
   */
  autoSelect: { type: Boolean, required: false, default: false },

  /**
   * The amount of time (in milliseconds) between when one `filter()`
   * call and the next.
   *
   * > __Note:__ `debounceTime` is ignored if `filter()` returns an
   * >           array instead of a Promise
   *
   * @property {number} debounceTime [500]
   */
  debounceTime: { type: Number, required: false, default: 500 },

  /**
   * The filter function to use (with existing data) instead of the
   * primary filter while debouncing is in effect
   *
   * @property {Function} debounceFilter
   */
  debounceFilter: { type: Function, required: false, default: null },

  describedbyIds: { type: String, required: false, default: '' },

  /**
   * A function that returns  list of options based on user input
   *
   * @property {Function} filter
   */
  filter: { type: Function, required: true },

  /**
   * ID of the combobox input field
   *
   * @property {string} id
   */
  id: { type: String, required: true },

  /**
   * If an icon is included in the option properties, whether or not
   * to render the icon before or after the option text;
   *
   * @property {boolean} iconLast [FALSE]
   */
  iconLast: { type: Boolean, required: false, default: false },
  invalid: { type: Boolean, required: false, default: false },

  /**
   * Label text for option list wrapper
   *
   * @property {string} id
   */
  label: { type: String, required: true },

  /**
   * When using keyboard navigation, whether or not to loop around
   * when user hits one end of the list of options
   *
   * @property {boolean} iconLast [FALSE]
   */
  loop: { type: Boolean, required: false, default: false },

  /**
   * Placeholder text for combobox input
   *
   * @property {string} placeholder ["" (empty string)]
   */
  placeholder: { type: String, required: false, default: '' },

  /**
   * Whether or not a valid value is required for this field
   *
   * @property {boolean} iconLast [FALSE]
   */
  required: { type: Boolean, required: false, default: false },

  /**
   * Tab index for combobox input field
   *
   * @property {number} tabindex [0]
   */
  tabindex: { type: Number, required: false, default: 0 },

  /**
   * Initial value for combobox input
   *
   * @property {string} value ["" (empty string)]
   */
  value: { type: String, required: false, default: '' },
  wrap: { type: Boolean, required: false, default: false },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

let bod = null;
let bouncingFilter = null;
let firstTime = true;

const activeID = ref(undefined);
const activeVal = ref(undefined);
const comboboxInput = ref(null);
const comboboxList = ref(null);
const comboboxWrap = ref(null);
const ePre = ref(null);
const filterStr = ref('');
const fetching = ref(false);
const maxIndex = ref(-1);
const options = ref([]);
const rawOptions = ref([]);
const retry = ref(0);
const selectedIndex = ref(null);
const showList = ref(false);
const _invalid = ref(false);

const comboListClass = ref(
  'absolute z-50 mt-2 w-full bg-white shadow-lg max-h-60 rounded-md '
  + 'overflow-y-scroll focus:outline-none sm:text-body-sm',
);

//  END:  Local state
// --------------------------------------------------
// START: pure helper functions

const getID = (block) => `${block}--${props.id}`;

/**
 * Emit a change event with relevant data (and an invalid event)
 *
 * Checks whether there is a currently selected item
 *
 * @param {Array}  _options Filtered list of options
 * @param {number} _index   Index of the currently selected option
 * @param {string} _str     Current filter string (in the input box)
 * @param {HTMLInputElement|null} _input Used to set the value of the
 *                          input field if not null
 *
 * @returns {void}
 */
const emitChange = (_options, _index, _str, _input = null, _close = false) => {
  const {
    rawOutput,
    validity,
    bad,
    output,
  } = getEmitData(_options, _index, _str);

  if (_close === true) {
    // Update the value in the input field
    _input.value = (bad === true) // eslint-disable-line no-param-reassign
      ? ''
      : rawOutput.label;
    // reset the focus to the input field
    _input.focus();
  }

  activeID.value = (bad === true)
    ? undefined
    : `${getID('item')}--${_index}`;
  activeVal.value = (bad === true)
    ? undefined
    : output;

  emit('change', getFauxInputEvent(output, rawOutput, validity));

  if (props.required === true) {
    emit('invalid', bad);
  }
};

//  END:  pure helper functions
// --------------------------------------------------
// START: Computed properties

const bColour = computed(() => { // eslint-disable-line arrow-body-style
  return (_invalid.value === true)
    ? 'border-red-500'
    : 'border-grey-300';
});

const getPlaceHolder = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.placeholder !== 'string' || props.placeholder.trim() === '')
    ? undefined
    : props.placeholder;
});

const inputClass = computed(() => 'flex w-full items-center '
  + `h-10 min-w-[160px] bg-white border ${bColour.value} rounded `
  + 'text-left text-body-md hover:bg-grey-50 px-6 '
  + 'focus:outline focus:outline-primary-500 focus:outline-2 '
  + 'focus:outline-offset-2');

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const decrement = (step = 1) => {
  if (maxIndex.value > -1) {
    if (selectedIndex.value === null) {
      selectedIndex.value = maxIndex.value;
    } else {
      const newVal = selectedIndex.value - step;
      if (newVal >= 0) {
        selectedIndex.value = newVal;
      } else if (props.loop === true) {
        selectedIndex.value = maxIndex.value;
      } else {
        selectedIndex.value = 0;
      }
    }

    emitChange(options.value, selectedIndex.value, filterStr.value, comboboxInput.value);
  }
};

const increment = (step = 1) => {
  if (maxIndex.value > -1) {
    if (selectedIndex.value === null) {
      selectedIndex.value = -1 + step;
    } else {
      const newVal = selectedIndex.value + step;
      if (newVal <= maxIndex.value) {
        selectedIndex.value = newVal;
      } else if (props.loop === true) {
        selectedIndex.value = 0;
      } else {
        selectedIndex.value = maxIndex.value;
      }
    }

    emitChange(options.value, selectedIndex.value, filterStr.value, comboboxInput.value);
  }
};

const resetDebounce = () => {
  retry.value = 0;
};

const setOptions = (optionList) => {
  rawOptions.value = getRawOptions(optionList);
  options.value = getRawOptions(optionList);
  maxIndex.value = (optionList.length - 1);

  let ok = true;
  let output = null;

  if (optionList.length === 1 && props.autoSelect === true) {
    selectedIndex.value = 0;
    output = [...optionList];
  } else if (maxIndex.value < 0) {
    ok = false;
  }

  if (output !== null || ok === false) {
    emitChange(
      options.value,
      selectedIndex.value,
      filterStr.value,
      comboboxInput.value,
    );
  }
};

const setOptionsThen = (response) => {
  if (!Array.isArray(response)) {
    throw new Error('');
  }

  fetching.value = false;
  retry.value = 0;

  setOptions(response);
};

const getOptionList = (str) => {
  const now = Date.now();

  if (fetching.value === false || retry.value < now) {
    fetching.value = false;
    retry.value = 0;
    const tmp = props.filter(str);
    showList.value = true;

    if (Array.isArray(tmp)) {
      setOptions(tmp);
    } else if (tmp instanceof Promise) {
      fetching.value = true;
      retry.value = (now + props.debounceTime);
      setTimeout(resetDebounce, props.debounceTime);

      tmp.then(setOptionsThen).catch((error) => {
        fetching.value = false;
        retry.value = 0;
        maxIndex.value = -1;

        console.error(
          `${ePre.value('handleInputKeyUp')} filter fetch failed `
          + `with error: "${error}"`,
        );
      });
    } else {
      throw new Error(
        `${ePre.value('handleInputKeyUp')} expects \`filter\` `
        + 'attribute to return either an array or a Promise. '
        + `${typeof tmp} returned`,
      );
    }
  } else {
    options.value = bouncingFilter(rawOptions.value, str, options.value);
  }
};

const handleEnter = (event) => {
  const val = (typeof event.target !== 'undefined'
    && typeof event.target.dataset !== 'undefined'
    && typeof event.target.dataset.value === 'string')
    ? event.target.dataset.value
    : '';
  selectedIndex.value = null;

  if (val !== '') {
    for (let a = 0; a < rawOptions.value.length; a += 1) {
      if (rawOptions.value[a].value === val) {
        selectedIndex.value = a;
        break;
      }
    }
  }

  emitChange(
    rawOptions.value,
    selectedIndex.value,
    filterStr.value,
    comboboxInput.value,
    true,
  );
  showList.value = false;
};

//  END:  Local methods
// --------------------------------------------------
// START: Event handlers

const handleInputFocus = () => {
  if (rawOptions.value.length > 0) {
    showList.value = true;
    getOptionList(filterStr.value);
  }
};

const handleKeyboardNav = (key, ctrl, event) => {
  const step = (ctrl === true)
    ? 5
    : 1;

  if (maxIndex.value > -1) {
    // Process k`eyboard events
    switch (key) { // eslint-disable-line default-case
      case 'ArrowDown':
      case 'Down':
        increment(step);
        break;

      case 'ArrowUp':
      case 'Up':
        decrement(step);
        break;

      case 'PageUp':
        decrement(10);
        break;

      case 'PageDown':
        increment(10);
        break;

      case 'Home':
        selectedIndex.value = 0;
        break;

      case 'End':
        selectedIndex.value = maxIndex.value;
        break;

      case 'Enter':
      case 'Return':
        handleEnter(event);
        break;

      case 'Esc':
      case 'Escape':
        selectedIndex.value = null;
        emitChange(options.value, selectedIndex.value, filterStr.value, comboboxInput.value, true);
        showList.value = false;
        break;

      case 'Tab':
        // @TODO close datalist dropdown
        break;
    }
  }
};

const handleInputKeyUp = (event) => {
  const val = event.target.value;
  const { key } = event;

  if (isPrintableCharacter(key)) {
    filterStr.value = val;
    getOptionList(val);
  } else {
    handleKeyboardNav(key, event.ctrlKey, event);
  }
};

const handleOptionKeyUp = (event) => {
  handleKeyboardNav(event.key, event.ctrlKey, event);
};

const handleOptionClick = (event) => {
  const { index, value } = event.target.dataset;

  if (isObj(options.value[index]) && options.value[index].value === value) {
    selectedIndex.value = index;
  } else {
    selectedIndex.value = null;
  }

  emitChange(
    options.value,
    selectedIndex.value,
    filterStr.value,
    comboboxInput.value,
    true,
  );
  showList.value = false;
};

const backgroundClick = (event) => {
  if (comboboxWrap.value.contains(event.target) === false) {
    showList.value = false;
  }
};

//  END:  Event handlers
// --------------------------------------------------
// START: Watcher methods

//  END:  watcher methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (bouncingFilter === null) {
    bouncingFilter = (typeof props.debounceFilter === 'function')
      ? props.debounceFilter
      : defaultFilter;
  }
  if (ePre.value === null) {
    ePre.value = getEpre('ComboboxInput', props.id);
    bod = document.body;

    bod.addEventListener('pointerup', backgroundClick);
  }
});

onMounted(() => {
  if (firstTime === true) {
    firstTime = false;

    comboboxInput.value.value = props.value;
  }
});

onUnmounted(() => {
  if (bod !== null) {
    bod.removeEventListener('pointerup', backgroundClick);
  }
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>
