import { LazyMTProps } from './types.js';
import {xc, ReactiveSurface, PropAction, PropDef, PropDefMap, IReactor} from 'xtal-element/lib/XtalCore.js';
import {insertAdjacentTemplate} from 'trans-render/lib/insertAdjacentTemplate.js';
import {passAttrToProp} from 'xtal-element/lib/passAttrToProp.js';
import {nudge} from 'xtal-element/lib/nudge.js';
import {zzz} from 'xtal-element/lib/zzz.js';

const baseProp : PropDef = {
    dry: true,
    async: true,
}
const baseBool: PropDef = {
    ...baseProp,
    type: Boolean
}
const bool1: PropDef = {
    ...baseBool,
    stopReactionsIfFalsy: true,
}
const bool2: PropDef = {
    ...baseBool,
    notify: true,
}
const bool3: PropDef = {
    ...baseBool,
    reflect: true
}

const propDefMap: PropDefMap<LazyMT> = {
    threshold: {
        type: Number,
        dry: true,
        async: true,
    },
    enter: bool1,
    exit: bool1,
    isVisible: bool2,
    isStartVisible: baseBool,
    cloned: bool3,
    mount: bool1,
    minMem: baseBool,
    toggleDisabled: baseBool,
    treatAsVisible: baseBool,
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
/**
 * @element lazy-mt
 */
export class LazyMT extends HTMLElement implements ReactiveSurface, LazyMTProps{
    static is = 'lazy-mt';
    static observedAttributes = slicedPropDefs.boolNames;
    propActions = propActions;
    self = this;
    reactor: IReactor = new xc.Rx(this);
    observer: IntersectionObserver | undefined;
    isVisible: boolean | undefined;
    isStartVisible: boolean | undefined;
    startRef: WeakRef<LazyMT> | undefined;
    webkitStartRef: LazyMT | undefined;
    /**
     * @private
     */
    cloned: boolean | undefined;
    templateRef: HTMLTemplateElement | undefined;
    /**
     * @private
     */
    disabledElements = new WeakSet<Element>();
    attributeChangedCallback(n: string, ov: string, nv: string){
        passAttrToProp(this, slicedPropDefs, n, ov, nv);
    }
    connectedCallback(){
        xc.mergeProps<Partial<LazyMT>>(this, slicedPropDefs, {
            threshold: 0.01
        });
    }
    onPropChange(name: string, prop: PropDef, nv: any){
        this.reactor.addToQueue(prop, nv);
    }
    disconnectedCallback(){
        if(this.observer !== undefined) this.observer.disconnect();
    }
    callback(entries: any, observer: any){
        const first = entries[0];
        if(first.intersectionRatio > 0){
            this.isVisible = true;
        }else{
            this.isVisible = false;
        }
    }
}
export interface LazyMT extends LazyMTProps{

}

const linkObserver = ({mount, threshold, self}: LazyMT) => {
    if(self.treatAsVisible){
        self.isVisible = true;
        return;
    }
    if(self.observer !== undefined) self.observer.disconnect();
    const ioi : IntersectionObserverInit = {
        threshold: threshold
    };
    self.observer = new IntersectionObserver(self.callback.bind(self), ioi);
    self.observer.observe(self);
    
}

const linkStartRef = ({exit, self}: LazyMT) => {
    const prev = self.previousElementSibling as HTMLTemplateElement;
    if(prev === null || prev.content === undefined) throw "No Template Found";
    const startRef = prev.previousElementSibling as LazyMT;
    if(startRef.localName !== LazyMT.is) throw "No Starting lazy-mt found.";
    if(typeof WeakRef === undefined){
        self.webkitStartRef = startRef;
    }else{
        self.startRef = new WeakRef(startRef);
    }
    
    startRef.addEventListener('is-visible-changed', e => {
        self.isStartVisible = (<any>e).detail.value;
    });
}

function toggleDisabled(self: LazyMT, start: HTMLElement, end: HTMLElement, val: boolean){
    let ns = start.nextElementSibling;
    while(ns !== null && ns !== end){
        if(val){
            zzz(ns);
        }else{
            nudge(ns);
        }
        ns = ns.nextElementSibling;
    }
}

function removeContent(self: LazyMT, start: HTMLElement, end: HTMLElement){
    self.cloned = false;
    const range = new Range();
    range.setStart(start, 0);
    range.setEnd(end, 0);
    range.deleteContents();
}

const linkClonedTemplate = ({isVisible, isStartVisible, exit, self}: LazyMT) => {
    const entry = (typeof WeakRef !== undefined) ? self.startRef!.deref() : self.webkitStartRef;
    if(entry === undefined) throw "No starting lazy-mt found.";
    if(isVisible || isStartVisible){
        if(!self.cloned){
            const prev = self.templateRef || self.previousElementSibling as HTMLTemplateElement;
            insertAdjacentTemplate(prev, entry, 'afterend');
            if(self.minMem && self.templateRef === undefined){
                self.templateRef = prev;
            }else{
                prev.remove();
            }
             //TODO support deleting materialized content
            self.cloned = true;
            entry.cloned = true;
        }else{
            if(!self.minMem){
                toggleDisabled(self, entry, self, false);
            }
            
        }
    }else if(self.cloned && self.toggleDisabled && !self.minMem){
        toggleDisabled(self, entry, self, true);
    }else if(self.cloned && self.minMem){
        removeContent(self, entry, self);
    }
};
const propActions = [
    linkObserver,
    linkStartRef,
    linkClonedTemplate
] as PropAction[];


xc.letThereBeProps(LazyMT, slicedPropDefs, 'onPropChange');
xc.define(LazyMT);