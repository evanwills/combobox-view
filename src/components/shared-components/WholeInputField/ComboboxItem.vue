<template>
  <li
    :aria-selected="selected"
    :class="itemClass"
    :data-value="value"
    :data-index="index"
    :id="itemID"
    role="option"
    tabindex="0">
    <span v-if="iconType === 'icon'">{{ icon }}</span>
    <img v-else-if="iconType === 'img'" :src="icon" alt="" />
    {{ labelTxt }}
  </li>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  ref,
} from 'vue';
import { getEpre } from '../../../utils/general-utils';

// --------------------------------------------------
// START: Vue 3 utilities

//  END:  Vue 3 utilities
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  focused: { type: Boolean, required: false, default: false },
  icon: { type: String, required: false, default: '' },
  id: { type: String, required: true },
  index: { type: Number, required: true },
  label: { type: String, required: false, default: '' },
  selected: { type: Boolean, required: false, default: false },
  value: { type: String, required: true },
  wrap: { type: Boolean, required: false, default: false },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const ePre = ref(null);

//  END:  Local state
// --------------------------------------------------
// START: pure helper functions

//  END:  pure helper functions
// --------------------------------------------------
// START: Computed properties

const itemID = computed(() => `${props.id}--${props.index}`);

const iconType = computed(() => {
  if (typeof props.icon !== 'string' || props.icon.trim() === '') {
    return '';
  }

  return (/\.[a-z\d]+$/i.test(props.icon) === true)
    ? 'img'
    : 'icon';
});

const labelTxt = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.label === 'string' && props.label.trim() !== '')
    ? props.label
    : props.value;
});

const itemClass = computed(() => {
  const tmp = (props.wrap === true)
    ? ' whitespace-normal py-2 '
    : ' leading-10 truncate ';

  let output = 'dropdown-item text-grey-900 cursor-pointer '
    + `text-body-m relative px-3 ${tmp} `
    + 'focus:bg-primary-500 focus:text-white focus:outline-none focus-visible:outline-auto '
    + 'hover:bg-primary-500 hover:text-white ';

  if (props.focused === true || props.selected === true) {
    output += 'bg-primary-500 text-white select outline-auto ';
  } else {
    output += ' select-none';
  }
  return output;
});

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

//  END:  Local methods
// --------------------------------------------------
// START: Event handlers

//  END:  Event handlers
// --------------------------------------------------
// START: Watcher methods

//  END:  watcher methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre('ComboboxItem', props.id);
  }
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>
