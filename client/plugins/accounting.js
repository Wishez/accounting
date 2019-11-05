

import Vue from 'vue'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import map from 'lodash/map'
const accounting = {};

accounting.settings = {
  currency: {
    symbol : "$",		// default currency symbol is '$'
    format : "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
    decimal : ".",		// decimal point separator
    thousand : ",",		// thousands separator
    precision : 2,		// decimal places
    grouping : 3		// digit grouping (not implemented yet)
  },
  number: {
    precision : 0,		// default precision on numbers is 0
    grouping : 3,		// digit grouping (not implemented yet)
    thousand : ",",
    decimal : "."
  }
};

function defaultsOptions(object = {}, defs = {}) {
  for (let key in defs) {
    if (defs.hasOwnProperty(key)) {
      // Replace values with defaults only if undefined (allow empty/zero values):
      if (object[key] == null) object[key] = defs[key];
    }
  }
  return object;
}

/**
 * Check and normalise the value of precision (must be positive integer)
*/
function checkPrecision(val, base) {
  val = Math.round(Math.abs(val));
  return isNaN(val)? base : val;
}

/**
 * Parses a format string or object and returns format obj for use in rendering
 *
 * `format` is either a string with the default (positive) format, or object
 * containing `pos` (required), `neg` and `zero` values (or a function returning
 * either a string or object)
 *
 * Either string or format.pos must contain "%v" (value) to be valid
 */
function checkCurrencyFormat(format) {
  const defaults = accounting.settings.currency.format;

  // Allow function as format parameter (should return string or object):
  if ( typeof format === "function" ) format = format();

  // Format can be a string, in which case `value` ("%v") must be present:
  if ( isString( format ) && format.match("%v") ) {

    // Create and return positive, negative and zero formats:
    return {
      pos : format,
      neg : format.replace("-", "").replace("%v", "-%v"),
      zero : format
    };

  // If no format, or object is missing valid positive value, use defaults:
  } else if ( !format || !format.pos || !format.pos.match("%v") ) {

    // If defaults is a string, casts it to an object for faster checking next time:
    return ( !isString( defaults ) ) ? defaults : accounting.settings.currency.format = {
      pos : defaults,
      neg : defaults.replace("%v", "-%v"),
      zero : defaults
    };

  }
  // Otherwise, assume format was fine:
  return format;
}

/* --- API Methods --- */

/**
 * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
 * Alias: `accounting.parse(string)`
 *
 * Decimal must be included in the regular expression to match floats (defaults to
 * accounting.settings.number.decimal), so if the number uses a non-standard decimal 
 * separator, provide it as the second argument.
 *
 * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
 *
 * Doesn't throw any errors (`NaN`s become 0) but this may change in future
 */
const unformat = accounting.unformat = accounting.parse = function(value, decimal) {
  // Recursively unformat arrays:
  if (isArray(value)) {
    return map(value, function(val) {
      return unformat(val, decimal);
    });
  }

  // Fails silently (need decent errors):
  value = value || 0;

  // Return the value as-is if it's already a number:
  if (typeof value === "number") return value;

  // Default decimal point comes from settings, but could be set to eg. "," in opts:
  decimal = decimal || accounting.settings.number.decimal;

    // Build regex to strip out everything except digits, decimal point and minus sign:
  const regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
    unformatted = parseFloat(
      ("" + value)
      .replace(/\((?=\d+)(.*)\)/, "-$1") // replace bracketed values with negatives
      .replace(regex, '')         // strip out any cruft
      .replace(decimal, '.')      // make sure decimal point is standard
    );

  // This will fail silently which may cause trouble, let's wait and see:
  return !isNaN(unformatted) ? unformatted : 0;
};

/**
 * Implementation of toFixed() that treats floats more like decimals
 *
 * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
 * problems for accounting- and finance-related software.
 */
const toFixed = accounting.toFixed = function(value, precision) {
  precision = checkPrecision(precision, accounting.settings.number.precision);

  const exponentialForm = Number(accounting.unformat(value) + 'e' + precision);
  const rounded = Math.round(exponentialForm);
  const finalResult = Number(rounded + 'e-' + precision).toFixed(precision);
  return finalResult;
};


/**
 * Format a number, with comma-separated thousands and custom precision/decimal places
 * Alias: `accounting.format()`
 *
 * Localise by overriding the precision and thousand / decimal separators
 * 2nd parameter `precision` can be an object matching `settings.number`
 */
const formatNumber = accounting.formatNumber = accounting.format = function(number, precision, thousand, decimal) {
  // Resursively format arrays:
  if (isArray(number)) {
    return map(number, function(val) {
      return formatNumber(val, precision, thousand, decimal);
    });
  }

  // Clean up number:
  number = unformat(number);

  // Build options object from second param (if object) or all params, extending defaults:
  const opts = defaultsOptions(
      (isObject(precision) ? precision : {
        precision : precision,
        thousand : thousand,
        decimal : decimal
      }),
      accounting.settings.number
    ),

    // Clean up precision
    usePrecision = checkPrecision(opts.precision),

    // Do some calc:
    negative = number < 0 ? "-" : "",
    base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
    mod = base.length > 3 ? base.length % 3 : 0;

  // Format the number:
  return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
}

/**
 * Format a number into currency
 *
 * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep, decimalSep, format)
 * defaults: (0, "$", 2, ",", ".", "%s%v")
 *
 * Localise by overriding the symbol, precision, thousand / decimal separators and format
 * Second param can be an object matching `settings.currency` which is the easiest way.
 *
 * To do: tidy up the parameters
 */
const formatMoney = accounting.formatMoney = function(number, symbol, precision, thousand, decimal, format) {
  if (isArray(number)) {
    return map(number, function(val){
      return formatMoney(val, symbol, precision, thousand, decimal, format);
    });
  }

  // Clean up number:
  number = unformat(number);

  // Build options object from second param (if object) or all params, extending defaults:
  const opts = defaultsOptions(
      (isObject(symbol) ? symbol : {
        symbol : symbol,
        precision : precision,
        thousand : thousand,
        decimal : decimal,
        format : format
      }),
      accounting.settings.currency
    ),

    // Check format (returns object with pos, neg and zero):
    formats = checkCurrencyFormat(opts.format),

    // Choose which format to use for this value:
    useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

  // Return with currency symbol added:
  return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
};


/**
 * Format a list of numbers into an accounting column, padding with whitespace
 * to line up currency symbols, thousand separators and decimals places
 *
 * List should be an array of numbers
 * Second parameter can be an object containing keys that match the params
 *
 * Returns array of accouting-formatted number strings of same length
 *
 * NB: `white-space:pre` CSS rule is required on the list container to prevent
 * browsers from collapsing the whitespace in the output strings.
 */
accounting.formatColumn = function(list, symbol, precision, thousand, decimal, format) {
  if (!list || !isArray(list)) return [];

  // Build options object from second param (if object) or all params, extending defaults:
  const opts = defaultsOptions(
      (isObject(symbol) ? symbol : {
        symbol : symbol,
        precision : precision,
        thousand : thousand,
        decimal : decimal,
        format : format
      }),
      accounting.settings.currency
    ),

    // Check format (returns object with pos, neg and zero), only need pos for now:
    formats = checkCurrencyFormat(opts.format),

    // Whether to pad at start of string or after currency symbol:
    padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false

    // Store value for the length of the longest string in the column:
    let maxLength = 0,

    // Format the list according to options, store the length of the longest string:
    formatted = map(list, function(val, i) {
      if (isArray(val)) {
        // Recursively format columns if list is a multi-dimensional array:
        return accounting.formatColumn(val, opts);
      } else {
        // Clean up the value
        val = unformat(val);

        // Choose which format to use for this value (pos, neg or zero):
        const useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

          // Format this value, push into formatted list and save the length:
          fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.precision), opts.thousand, opts.decimal));

        if (fVal.length > maxLength) maxLength = fVal.length;
        return fVal;
      }
    });

  // Pad each number in the list and send back the column of numbers:
  return map(formatted, function(val, i) {
    // Only if this is a string (not a nested array, which would have already been padded):
    if (isString(val) && val.length < maxLength) {
      // Depending on symbol position, pad after symbol or at index 0:
      return padAfterSymbol ? val.replace(opts.symbol, opts.symbol+(new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
    }
    return val;
  });
};

export default accounting
