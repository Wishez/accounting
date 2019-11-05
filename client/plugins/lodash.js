import Vue from 'vue'
import moment from "moment";
import get from 'lodash/get'
import unionBy from 'lodash/unionBy'
import uniqueId from 'lodash/uniqueId'
import omit from 'lodash/omit'
import isEmpty from 'lodash/isEmpty'
import pick from 'lodash/pick'
import last from 'lodash/last'
import mapValues from 'lodash/mapValues'
import upperFirst from 'lodash/upperFirst'
import cyrillicToTranslit from 'cyrillic-to-translit-js'

const getHexFromHsl = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const getHslFromHex = (hex) => {
  if (!hex) return {}
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  let r = parseInt(result[1], 16)
  let g = parseInt(result[2], 16)
  let b = parseInt(result[3], 16)
  r /= 255, g /= 255, b /= 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue, saturation, luminosity = (max + min) / 2;
  if (max == min) {
    hue = saturation = 0; // achromatic
  } else {
    const differance = max - min;
    saturation = luminosity > 0.5 ? differance / (2 - max - min) : differance / (max + min);
    switch (max) {
      case r: hue = (g - b) / differance + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / differance + 2; break;
      case b: hue = (r - g) / differance + 4; break;
    }
    hue /= 6;
  }

  return {
    hue: hue * 255,
    saturation: saturation * 100,
    luminosity: luminosity * 100 ,
  }
}

function changeColorLightness(col, amt) {
  let usePound = false;

  if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
  }

  let num = parseInt(col,16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  let b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  let g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

const getNumberFromMoney = value => {
  const withReplacedSuffix = String(value).replace(',', '.')
  const cleanValue = withReplacedSuffix.replace(/[^\d\.]/g, '')
  return Number(parseFloat(cleanValue).toFixed(2))
}

const translitCompiler = cyrillicToTranslit()
const transliteText = (value, delimiters) => translitCompiler.transform(value.toLowerCase(), delimiters) 

const getTime = date => new Date(date).getTime()

const isDateInRange = (until, since) => {
  const untilTime = getTime(until)
  const sinceTime = getTime(since)
  const shouldCheckBoth = until && since
  return date => {
    const dateTime = getTime(date)
    const lessThanUntil = dateTime <= untilTime
    const moreThanSinceDate = dateTime >= sinceTime
    if (shouldCheckBoth) return lessThanUntil && moreThanSinceDate
    else if (until) return lessThanUntil
    else if (since) return moreThanSinceDate
    
    return true
  }
}

const sortByDate = (items, dateFieldName) => items.sort((a, b) => getTime(b[dateFieldName]) - getTime(a[dateFieldName]))

export const formatDate = (date, format = "L") => {
  if (typeof date === "string") {
    date = date.replace(/[-\.]/g, "/");
  }

  return moment(date).locale('ru').format(format);
}

Vue.prototype.$lodash = {
  get,
  getHexFromHsl,
  getHslFromHex,
  unionBy,
  changeColorLightness,
  transliteText,
  omit,
  uniqueId,
  isEmpty,
  getNumberFromMoney,
  pick,
  last,
  mapValues,
  upperFirst,
  sortByDate,
  formatDate,
  isDateInRange,
}
