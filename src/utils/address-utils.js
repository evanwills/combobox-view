/**
 * This file contains a collection of (mostly) "pure" function that
 * help with handling address data from an API
 *
 * Each function is exported so it can be easily unit tested.
 *
 * @file address-utils.js
 * @author Evan Wills <evan.wills@thesmithfamily.com.au>
 */

import {
  empty2null,
  emptyOrNull,
  objectsAreSame,
  rewriteObjPropNames,
} from './data-utils';
import { ucFirst } from './general-utils';

// ========================================================
// START: JSDoc type definitions

/**
 * Object that can be used by Autocomplete address type ahead field
 *
 * @typedef TAddrListItem
 * @type {object}
 *
 * @property {string} id
 * @property {string} label
 * @property {string} normalised
 * @property {number} score
 * @property {string} value
 */

/**
 * Seven part address obj that can be sent to the server
 *
 * @typedef TSevenPartAddr
 * @type {object}
 *
 * @property {string|null} line1 Address line 1 (required)
 * @property {string|null} line2 Address line 2 (optional)
 * @property {string|null} line3 Address line 3 (optional)
 * @property {string|null} suburb Suburb (required)
 * @property {string|null} state State (required)
 * @property {string|null} postcode Post code/zip code (required)
 * @property {string|null} country Country (defaults to Australia)
 */

/**
 * Seven part address obj that can be sent to the server
 *
 * @typedef TSevenPartStreetAddr
 * @type {object}
 *
 * @property {string|null} StreetLine1 Address line 1 (required)
 * @property {string|null} StreetLine2 Address line 2 (optional)
 * @property {string|null} StreetLine3 Address line 3 (optional)
 * @property {string|null} StreetSuburb Suburb (required)
 * @property {string|null} StreetState State (required)
 * @property {string|null} StreetPostcode Post code/zip code (required)
 * @property {string|null} StreetCountry Country (defaults to Australia)
 */

/**
 * Seven part address obj that can be sent to the server
 *
 * @typedef TSevenPartPostalAddr
 * @type {object}
 *
 * @property {string|null} PostalLine1 Address line 1 (required)
 * @property {string|null} PostalLine2 Address line 2 (optional)
 * @property {string|null} PostalLine3 Address line 3 (optional)
 * @property {string|null} PostalSuburb Suburb (required)
 * @property {string|null} PostalState State (required)
 * @property {string|null} PostalPostcode Post code/zip code (required)
 * @property {string|null} PostalCountry Country (defaults to Australia)
 */

/**
 * Object returned by the Experian address API on UAT/PROD environment
 *
 * @typedef TExperianAddressPROD
 * @type {object}
 *
 * @property {string}  monikerField
 * @property {string}  partialAddressField
 * @property {string}  picklistField
 * @property {string}  postcodeField
 * @property {string}  scoreField
 * @property {null}    qAAddressField
 * @property {boolean} fullAddressField
 * @property {boolean} multiplesField
 * @property {boolean} canStepField
 * @property {boolean} aliasMatchField
 * @property {boolean} postcodeRecodedField
 * @property {boolean} crossBorderMatchField
 * @property {boolean} dummyPOBoxField
 * @property {boolean} nameField
 * @property {boolean} informationField
 * @property {boolean} warnInformationField
 * @property {boolean} incompleteAddrField
 * @property {boolean} unresolvableRangeField
 * @property {boolean} phantomPrimaryPointField
 * @property {boolean} subsidiaryDataField
 * @property {boolean} extendedDataField
 * @property {boolean} enhancedDataField
 */

/**
 * Object returned by the Experian address API on SIT/Dev environment
 *
 * @typedef TExperianAddressSIT
 * @type {object}
 *
 * @property {string}  Moniker
 * @property {string}  PartialAddress
 * @property {string}  Picklist
 * @property {string}  Postcode
 * @property {string}  Score
 * @property {null}    QAAddress
 * @property {boolean} FullAddress
 * @property {boolean} Multiples
 * @property {boolean} CanStep
 * @property {boolean} AliasMatch
 * @property {boolean} PostcodeRecoded
 * @property {boolean} CrossBorderMatch
 * @property {boolean} DummyPOBox
 * @property {boolean} Name
 * @property {boolean} Information
 * @property {boolean} WarnInformation
 * @property {boolean} IncompleteAddr
 * @property {boolean} UnresolvableRange
 * @property {boolean} PhantomPrimaryPoint
 * @property {boolean} SubsidiaryData
 * @property {boolean} ExtendedData
 * @property {boolean} EnhancedData
 */

/**
 * An object that can be either a Prod or Dev version of the
 * Experian address API data.
 *
 * @typedef {(TExperianAddressSIT|TExperianAddressPROD)} UExperianAddress
 * @type {object}
 */

/**
 * Known good keys for `address` and `score` properties to use when
 * building a normalised address object that can be passed to
 * Autocomplete search functions.
 *
 * @typedef TExperianKeys
 * @type {object}
 *
 * @property {string} addr  Experian API property name for address
 *                          field
 * @property {string} score Experian API property name for match
 *                          score
 */

//  END:  JSDoc type definitions
// ========================================================

/**
 * Check if all the required fields of an address object are
 * non-empty
 *
 * @param {object} addr Address object to be checked
 *
 * @returns {boolean} TRUE if Line1, Suburb, State & Postcode are
 *                    non-empty. FALSE otherwise.
 */
export const addressIsValid = (addr) => {
  const required = [
    'line1',
    'suburb',
    'state',
    'postcode',
  ];

  for (const prop of required) {
    if (emptyOrNull(addr[prop]) === true) {
      return false;
    }
  }

  return true;
};

/**
 * Convert a seven part postal (or street) address to basic seven
 * part address
 *
 * @param {TSevenPartPostalAddr|TSevenPartStreetAddr} addr
 *
 * @returns {TSevenPartAddr}
 */
export const stripAddrTypePrefix = (addr) => rewriteObjPropNames(
  addr,
  (key) => key.substring(6).toLocaleLowerCase(),
);

/**
 * Prepend a prefix to each key in a seven part address object
 *
 * @param {TSevenPartAddr} addr   Seven part address object
 * @param {String}         prefix Prefix string to add to each key
 *                                in object
 * @returns {TSevenPartStreetAddr|TSevenPartPostalAddr}
 */
export const prefixAddr = (addr, prefix) => {
  const _pre = ucFirst(prefix);

  return rewriteObjPropNames(
    addr,
    (key) => `${_pre}${ucFirst(key)}`,
  );
};

/**
 * Convert a seven part postal address to seven part street address
 * or vice versa
 *
 * @param {TSevenPartPostalAddr|TSevenPartStreetAddr} addr
 * @param {string} oldPre Old/current property key prefix
 * @param {string} newPre New/future property key prefix
 *
 * @returns {TSevenPartStreetAddr|TSevenPartPostalAddr}
 */
export const changeAddrPrefix = (
  addr,
  oldPre = 'Postal',
  newPre = 'Street',
) => rewriteObjPropNames(
  addr,
  (key) => key.replace(oldPre, newPre),
);

/**
 * Compare two addresses to see if they are identical
 *
 * @param {object} addr1 Address 1
 * @param {object} addr2 Address 2
 *
 * @returns {boolean} TRUE if all fields in both addresses match and have the same value.
 *                    FALSE otherwise
 *
 * @throws {Error} If Address 1 and Address 2 don't have the same
 *                 number of properties
 * @throws {Error} Property names (in the same position) do not have
 *                 compatible names
 */
export const addressIsSame = (addr1, addr2) => objectsAreSame(
  stripAddrTypePrefix(addr1),
  stripAddrTypePrefix(addr2),
);

/**
 * Convert and address object to a human readable (single line)
 * address
 *
 * @param {object} input Address object
 * @param {string} sep   Seperator character(s) to place between
 *                       fragments of the address
 *
 * @returns {string} Human readable address string.
 */
export const addressToHuman = (input, sep = ', ') => {
  let output = '';
  let _sep = '';

  for (const key of Object.keys(input)) {
    if (input[key] !== null && typeof input[key] === 'string') {
      const tmp = input[key].trim();
      if (tmp !== '') {
        output += _sep + tmp;
        _sep = sep;
      }
    }
  }

  return output;
};

/**
 * Convert street type abbreviations to their full text equivalent
 *
 * @param {string} addr Address to be cleaned up
 *
 * @returns {string} cleaned address
 */
export const makeAbbrFull = (addr) => {
  const fixes = [
    [/(?<= )ave(?= )/, 'avenue'],
    [/(?<= )bvd(?= )/, 'boulevard'],
    [/(?<= )cir(?= )/, 'circle'],
    [/(?<= )cct(?= )/, 'circuit'],
    [/(?<= )crcs(?= )/, 'circus'],
    [/(?<= )ct(?= )/, 'court'],
    [/(?<= )cres(?= )/, 'crescent'],
    [/(?<= )dr(?= )/, 'drive'],
    [/(?<= )esp(?= )/, 'esplanade'],
    [/(?<= )fwy(?= )/, 'freeway'],
    [/(?<= )hwy(?= )/, 'highway'],
    [/(?<= )ln(?= )/, 'lane'],
    [/(?<= )mwy(?= )/, 'motorway'],
    [/(?<= )pde(?= )/, 'parade'],
    [/(?<= )pkwy(?= )/, 'parkway'],
    [/(?<= )plza(?= )/, 'plaza'],
    [/(?<= )pl(?= )/, 'place'],
    [/(?<= )prom(?= )/, 'promenade'],
    [/(?<= )rd(?= )/, 'road'],
    [/(?<= )sq(?= )/, 'sq'],
    [/(?<= )stra(?= )/, 'strand'],
    [/(?<= )st(?= )/, 'street'],
    [/(?<= )tce(?= )/, 'terrace'],
    [/(?<= )trl(?= )/, 'trail'],
  ];

  let output = addr;

  for (const fix of fixes) {
    output = output.replace(fix[0], ` ${fix[1]}`);
  }

  return addr;
};

/**
 * Normalise an address string to make it easier to match.
 *
 * 1. Remove all non-alpha numeric characters and replace them
 *    with spaces.
 * 2. Trim any leading and traling white space
 * 3. Make string all lowercase
 *
 * @param {string} addr Address string to be normalised
 *
 * @returns {string}
 */
export const normalisAddr = (addr) => {
  if (typeof addr === 'string') {
    return addr.replace(/[^a-z\d]+/ig, ' ').trim().toLowerCase();
  }

  return addr;
};

/**
 * Convert Experian API address object into something more useful
 *
 * @param {TExperianKeys} keys Keys to match address and score keys
 *                             found in Experian API data supplied
 *
 * @returns {(UExperianAddress) => TAddrListItem} Function that can
 *                             be passed to Array.map() to get
 *                             normalised address data that can be
 *                             used in Autocomplete search
 */
export const getAddr = (keys) => (data) => {
  const addr = data[keys.addr];

  return {
    id: addr,
    label: addr,
    value: addr,
    score: [keys.score],
    normalised: normalisAddr(addr),
  };
};

/**
 * Get the label string for a single address option
 *
 * @param {Object} data Address data for a single address option
 *
 * @returns {string} Human readable address
 */
export const getAddrLabel = (data) => { // eslint-disable-line arrow-body-style
  return (typeof data.label === 'string')
    ? data.label
    : '';
};

/**
 * Split an address string into parts so those parts can be put into
 * an address object
 *
 * @param {string} address Address string as provided by Experian API
 *
 * @returns {Array} An array of address parts
 */
export const splitAddressStr = (address) => address.split(',').map(
  (part) => part.split('  ').map(
    (bit) => bit.trim(),
  ),
);

/**
 * Take the fragments of an Experian Address API address and put
 * them in a seven part address object.
 *
 * @param {Array} addrBits
 *
 * @returns {TSevenPartAddr}
 */
export const makeTsfAddressInner = (addrBits) => {
  const fields = ['suburb', 'state', 'postcode'];
  const output = {
    line1: null,
    line2: null,
    line3: null,
    suburb: null,
    state: null,
    postcode: null,
    country: null,
  };
  const twoPart = addrBits.length > 1;

  let ok = false;

  // Assign each part of the address string to output properties.
  for (let a = 0; a < 3; a += 1) {
    const lineKey = `line${a + 1}`;
    output[lineKey] = empty2null(addrBits[0][a]);

    if (output[lineKey] !== null) {
      ok = true;
    }

    if (twoPart === true) {
      const oKey = fields[a];
      output[oKey] = empty2null(addrBits[1][a]);

      if (output[oKey] !== null) {
        ok = true;
      }
    }
  }

  return { output, ok };
};

/**
 * Convert an Experien Address API address string to a seven part
 * address object.
 *
 * @param {string} address Experian Address API address string
 *
 * @returns {TSevenPartAddr}
 */
export const makeTsfAddress = (address) => {
  const { output, ok } = makeTsfAddressInner(splitAddressStr(address));

  if (ok === true) {
    output.country = 'AUSTRALIA';
  }

  return output;
};

/**
 * Convert selected address string into User address object
 *
 * @param {string} addressType Type of address
 *                             (usually "Street" or "Postal")
 * @param {string} address     Address string selected by user
 *
 * @returns {object}
 */
export const makeUserAddress = (addressType, address) => {
  const prefix = ucFirst(addressType.toLowerCase());
  const output = {};

  for (const key of Object.keys(address)) {
    const _key = `${prefix}${ucFirst(key)}`;
    output[_key] = address[key];
  }

  return output;
};

/**
 * Get the apprpriate address and score keys for the address & score
 * properties based on the Experian Address API object that is
 * provided.
 *
 * > __NOTE:__ This is necessary because Experian API returns
 *             different data depending on whether it's called from
 *             local/SIT or UAT/PROD.
 * >           Without this step, the Experian API will only work in
 * >           either Dev or Prod environment. Not both!
 *
 * @param {UExperianAddress} data
 *
 * @returns {TExperianKeys}
 */
const getKeys = (data) => {
  const output = {
    addr: 'partialAddressField',
    score: 'scoreField',
  };
  if (typeof data.PartialAddress === 'string') {
    output.addr = 'PartialAddress';
    output.score = 'Score';
  }

  return output;
};

/**
 * Get data from the Search API (if we have enough text to start)
 *
 * @param {function} search   Async API address search function
 * @param {number}   minChars Minimum number of characters required
 *                            before calling search
 *
 * @returns {array} List of matched addresses.
 */
export const addressApiSearch = (search, minChars = 5) => {
  if (typeof search !== 'function') {
    throw new Error(
      'addressApiSearch() expects first argument `search` to be a '
      + `callable function. ${typeof search} given`,
    );
  }

  const isNum = (typeof minChars === 'number');
  if (isNum === false || minChars < 0 || minChars > 100) {
    const tmp = (isNum === false)
      ? typeof minChars
      : minChars;

    throw new Error(
      'addressApiSearch() expects second argument `minChars` to be '
      + 'a number between zero and one hundred inclusive. '
      + `${tmp} given`,
    );
  }

  return async (input) => {
    if (input.length > minChars) {
      const tmp = await search(input);
      let output = [];

      if (typeof tmp.data !== 'undefined') {
        if (tmp.data.PickListEntries.length > 0) {
          // This is required to make Experian API work in both Dev
          // and Prod environments
          const keys = getKeys(tmp.data.PickListEntries[0]);

          output = tmp.data.PickListEntries.map(getAddr(keys));
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('Failed to get address list');
      }

      output.push({
        label: 'Unable to find address?',
        score: 0,
        normalised: 'manual address',
        value: 'manual address',
      });

      return output;
    }

    return [];
  };
};
