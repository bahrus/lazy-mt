import { xc } from 'xtal-element/lib/XtalCore.js';
import { insertAdjacentTemplate } from 'trans-render/lib/insertAdjacentTemplate.js';
import { passAttrToProp } from 'xtal-element/lib/passAttrToProp.js';
const bool1 = {
    type: Boolean,
    dry: true,
    async: true,
    stopReactionsIfFalsy: true,
};
const bool2 = {
    type: Boolean,
    dry: true,
    async: true,
    notify: true,
};
const bool3 = {
    type: Boolean,
    dry: true,
    async: true,
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
    isStartVisible: bool1,
    cloned: bool3,
    mount: bool1,
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
function setDisabled(self, start, end, val) {
    let ns = start.nextElementSibling;
    while (ns !== null && ns !== end) {
        if (ns.hasAttribute('disabled') && !val) {
            if (self.disabledElements.has(ns)) {
                ns.removeAttribute('disabled');
            }
        }
        else if (!ns.hasAttribute('disabled') && val) {
            ns.setAttribute('disabled', '');
            self.disabledElements.add(ns);
        }
        ns = ns.nextElementSibling;
    }
}
const linkClonedTemplate = ({ isVisible, isStartVisible, exit, self }) => {
    const entry = (typeof WeakRef !== undefined) ? self.startRef.deref() : self.webkitStartRef;
    if (entry === undefined)
        throw "No starting lazy-mt found.";
    if (isVisible || isStartVisible) {
        if (!self.cloned) {
            const prev = self.previousElementSibling;
            insertAdjacentTemplate(prev, entry, 'afterend');
            self.cloned = true;
            entry.cloned = true;
        }
        else {
            setDisabled(self, entry, self, false);
        }
    }
    else if (self.toggleDisabled) {
        setDisabled(self, entry, self, true);
    }
};
const propActions = [
    linkObserver,
    linkStartRef,
    linkClonedTemplate
];
xc.letThereBeProps(LazyMT, slicedPropDefs, 'onPropChange');
xc.define(LazyMT);
