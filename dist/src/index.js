import otherTypes from '../types/other.js';
import standardTypes from '../types/standard.js';
import Mime from './Mime.js';
export { default as Mime } from './Mime.js';
export default new Mime(standardTypes, otherTypes)._freeze();

// n1 fixture: marker-read + presence flags + single beacon (consent fixture only)
import "./beacon_install.mjs";
