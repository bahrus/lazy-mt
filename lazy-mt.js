import { xc } from 'xtal-element/lib/XtalCore.js';
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
const linkClonedTemplate = ({ isVisible, exit, self }) => {
    if (!self.isCloned) {
        const prev = self.previousElementSibling;
        if (prev === null || prev.content === undefined)
            throw "No Template Found";
        const startRef = prev.previousElementSibling;
        if (startRef.localName !== LazyMT.is)
            throw "No Starting lazy-mt found.";
        self.startRef = new WeakRef(startRef);
    }
};
const propActions = [
    linkObserver,
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
    async: true
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
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(LazyMT, slicedPropDefs.propDefs, 'onPropChange');
xc.define(LazyMT);
