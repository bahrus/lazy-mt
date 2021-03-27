import { xc } from 'xtal-element/lib/XtalCore.js';
import { insertAdjacentTemplate } from 'trans-render/lib/insertAdjacentTemplate.js';
import { passAttrToProp } from 'xtal-element/lib/passAttrToProp.js';
import { nudge } from 'xtal-element/lib/nudge.js';
import { zzz } from 'xtal-element/lib/zzz.js';
const baseProp = {
    dry: true,
    async: true,
};
const baseBool = {
    ...baseProp,
    type: Boolean
};
const bool1 = {
    ...baseBool,
    stopReactionsIfFalsy: true,
};
const bool2 = {
    ...baseBool,
    notify: true,
};
const bool3 = {
    ...baseBool,
    reflect: true
};
const propDefMap = {
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
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
/**
 * @element lazy-mt
 */
export class LazyMT extends HTMLElement {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
        this.self = this;
        this.reactor = new xc.Rx(this);
        this.disabledElements = new WeakSet();
    }
    attributeChangedCallback(n, ov, nv) {
        passAttrToProp(this, slicedPropDefs, n, ov, nv);
    }
    connectedCallback() {
        xc.hydrate(this, slicedPropDefs, {
            threshold: 0.01
        });
    }
    onPropChange(name, prop, nv) {
        this.reactor.addToQueue(prop, nv);
    }
    disconnectedCallback() {
        if (this.observer !== undefined)
            this.observer.disconnect();
    }
    callback(entries, observer) {
        const first = entries[0];
        if (first.intersectionRatio > 0) {
            this.isVisible = true;
        }
        else {
            this.isVisible = false;
        }
    }
}
LazyMT.is = 'lazy-mt';
LazyMT.observedAttributes = slicedPropDefs.boolNames;
const linkObserver = ({ mount, threshold, self }) => {
    if (self.observer !== undefined)
        self.observer.disconnect();
    const ioi = {
        threshold: threshold
    };
    self.observer = new IntersectionObserver(self.callback.bind(self), ioi);
    self.observer.observe(self);
};
const linkStartRef = ({ exit, self }) => {
    const prev = self.previousElementSibling;
    if (prev === null || prev.content === undefined)
        throw "No Template Found";
    const startRef = prev.previousElementSibling;
    if (startRef.localName !== LazyMT.is)
        throw "No Starting lazy-mt found.";
    if (typeof WeakRef === undefined) {
        self.webkitStartRef = startRef;
    }
    else {
        self.startRef = new WeakRef(startRef);
    }
    startRef.addEventListener('is-visible-changed', e => {
        self.isStartVisible = e.detail.value;
    });
};
function toggleDisabled(self, start, end, val) {
    let ns = start.nextElementSibling;
    while (ns !== null && ns !== end) {
        if (val) {
            zzz(ns);
        }
        else {
            nudge(ns);
        }
        ns = ns.nextElementSibling;
    }
}
function removeContent(self, start, end) {
    self.cloned = false;
    const range = new Range();
    range.setStart(start, 0);
    range.setEnd(end, 0);
    range.deleteContents();
}
const linkClonedTemplate = ({ isVisible, isStartVisible, exit, self }) => {
    const entry = (typeof WeakRef !== undefined) ? self.startRef.deref() : self.webkitStartRef;
    if (entry === undefined)
        throw "No starting lazy-mt found.";
    if (isVisible || isStartVisible) {
        if (!self.cloned) {
            const prev = self.templateRef || self.previousElementSibling;
            insertAdjacentTemplate(prev, entry, 'afterend');
            if (self.minMem && self.templateRef === undefined) {
                self.templateRef = prev;
            }
            else {
                prev.remove();
            }
            //TODO support deleting materialized content
            self.cloned = true;
            entry.cloned = true;
        }
        else {
            if (!self.minMem) {
                toggleDisabled(self, entry, self, false);
            }
        }
    }
    else if (self.cloned && self.toggleDisabled && !self.minMem) {
        toggleDisabled(self, entry, self, true);
    }
    else if (self.cloned && self.minMem) {
        removeContent(self, entry, self);
    }
};
const propActions = [
    linkObserver,
    linkStartRef,
    linkClonedTemplate
];
xc.letThereBeProps(LazyMT, slicedPropDefs, 'onPropChange');
xc.define(LazyMT);
