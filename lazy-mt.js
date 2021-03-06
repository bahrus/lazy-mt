import { xc } from 'xtal-element/lib/XtalCore.js';
import { insertAdjacentTemplate } from 'trans-render/lib/insertAdjacentTemplate.js';
/**
 * @element lazy-mt
 */
export class LazyMT extends HTMLElement {
    constructor() {
        super(...arguments);
        this.propActions = propActions;
        this.self = this;
        this.reactor = new xc.Rx(this);
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
const linkObserver = ({ threshold, self }) => {
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
    self.startRef = new WeakRef(startRef);
    startRef.addEventListener('is-visible-changed', e => {
        self.isStartVisible = e.detail.value;
    });
};
const linkClonedTemplate = ({ isVisible, isStartVisible, exit, self }) => {
    if (isVisible || isStartVisible) {
        if (!self.isCloned) {
            const prev = self.previousElementSibling;
            const entry = self.startRef.deref();
            insertAdjacentTemplate(prev, entry, 'afterend');
            self.isCloned = true;
            entry.isCloned = true;
        }
    }
};
const propActions = [
    linkObserver,
    linkStartRef,
    linkClonedTemplate
];
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
        reflect: true,
        dry: true,
        async: true,
    },
    enter: bool1,
    exit: bool1,
    isVisible: bool2,
    isStartVisible: bool1,
    isCloned: bool3,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(LazyMT, slicedPropDefs.propDefs, 'onPropChange');
xc.define(LazyMT);
