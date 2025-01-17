<template>
  <ComboboxInput
    auto-select
    :filter="getOptions"
    id="combobox"
    label="Australian states"
    placeholder="Start typing"
    v-on:change="handleComboChange" />
</template>

<script setup>
import WholeInputField from './components/shared-components/WholeInputField/WholeInputField.vue';
import './assets/scss/main.scss';
import ComboboxInput from './components/shared-components/WholeInputField/ComboboxInput.vue';

const multiOptions = [
  { value: '1', label: 'first option' },
  { value: '2', label: 'Two is a cool number' },
  { value: '3', label: '33' },
  { value: '4', label: 'Quarter of the way to the end of the list. Well actually not really, we are more like 80% of the way to the end of the list' },
  { value: 'five', label: 'Only joking 5 is the end' },
];

const normaliseStr = (str) => str.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '');

const auStates = [
  { value: 'ACT', label: 'Australian Captial Territory' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'Qld', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'Tas', label: 'Tasmania' },
  { value: 'WA', label: 'Western Australia' },
];

const getOptions = (input) => {
  console.group('App.getOptions()');
  console.log('input:', input);
  console.groupEnd();
  const val = normaliseStr(input);

  return auStates.filter(
    (item) => (normaliseStr(item.value).includes(val) || normaliseStr(item.label).includes(val)),
  ).map((item) => ({ ...item, icon: '' }));
};

const handleComboChange = (event) => {
  console.group('App.handleComboChange()');
  console.log('event:', event);
  console.log('event.target:', event.target);
  console.log('event.target.value:', event.target.value);
  console.log('event.target.rawValue:', event.target.rawValue);
  console.log('event.target.validity:', event.target.validity);
  console.log('event.target.checkValidity():', event.target.checkValidity());
  console.groupEnd();
};

const txtInpAttr = {
  placeholder: 'Enter text (non-alpha-numeric shows error)',
  pattern: '^[a-z0-9]+$'
};
const numInpAttr = {
  placeholder: 'e.g. 25',
  min: 10,
  max: 40,
  step: 1
};
const dateInpAttr = {
  min: '2023-05-10',
  max: '2023-05-20'
};
const badDateInpAttr = {
  min: 'I am chicken',
  max: 1684210093,
};
const dateTimeInpAttr = {
  min: '1979-01-29T09:00:00+12:00',
  max: '2028-11-16T15:10:00+11:00',
};
const textareaAttr = { rows: 11, };

const validPasswd = (input) => {
  const matches = input.match(/[\[\]\\\/\`\-0-9_+=!@#$%^&*(){}|:";'<>?,.~ ]/g);

  if (matches !== null && matches.length > 1) {
    return true;
  }

  return 'Your password must include at least 2 non alphabetical characters';
}

const getPickleLabel = (data) => data.label;

/**
 *
 *
 * @param {function} search Async API address search function
 *
 * @returns {array} List of matched addresses.
 */
const getPickle = (input) => {
  return [
    {
      id: 'evan',
      label: 'Evan',
    },
    {
      label: 'Ivan',
      id: 'ivan',
    },
    {
      label: 'Tarrin',
      id: 'tarrin',
    },
    {
      label: 'Toria',
      id: 'victoria',
    },
    {
      label: 'Mallee',
      id: 'mallee',
    },
    {
      label: 'Ada',
      id: 'ada',
    },
    {
      label: 'Emile',
      id: 'emile',
    },
    {
      label: 'Owen',
      id: 'owen',
    },
    {
      id: 'unknown',
      label: 'Unable to find address?',
    }
  ];
};

const likertOptions = [
  { value: '0', label: 'N/A' },
  { value: '1', label: 'Very bad' },
  { value: '2', label: 'Bad' },
  { value: '3', label: 'Acceptable' },
  { value: '4', label: 'Good' },
  { value: '5', label: 'Very good' },
];

const likertQuestions = [
  { id: 'q1', label: 'Apples' },
  { id: 'q2', label: 'Cars' },
  { id: 'q3', label: 'Bicycles' },
  { id: 'q4', label: 'Trains' },
  { id: 'q5', label: 'Conservative polititions' },
  { id: 'q6', label: 'Fast food chains' },
];

const pickleValidation = (input) => {
  return (input.length < 5)
    ? 'Please enter at least 5 characters'
    : '';
}
</script>

<style scoped>
</style>
