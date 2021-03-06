import { LazyMTProps } from './types.js';
import {xc, ReactiveSurface, PropAction, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';

/**
 * @element laissez-dom
 */
export class LazyMT extends HTMLElement{
    static is = 'lazy-mt';
    
}

xc.define(LazyMT);