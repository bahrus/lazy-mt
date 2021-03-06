import { LazyMTProps } from './types.js';
import {xc, ReactiveSurface, PropAction, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';

/**
 * @element lazy-mt
 */
export class LazyMT extends HTMLElement implements ReactiveSurface, LazyMTProps{
    static is = 'lazy-mt';
    propActions = propActions;
    self = this;
    reactor = new xc.Rx(this);
    observer: IntersectionObserver | undefined;
    isVisible: boolean | undefined;
    startRef: WeakRef<LazyMT> | undefined;
    threshold: number | undefined;
    enter: boolean | undefined;
    exit: boolean | undefined;
    isCloned: boolean | undefined;
    clonedTemplate: DocumentFragment | undefined;
    toggleDisabled?: boolean | undefined;
    connectedCallback(){
        xc.hydrate<LazyMTProps>(this, slicedPropDefs, {
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

const linkObserver = ({threshold, self}: LazyMT) => {
    if(self.observer !== undefined) self.observer.disconnect();
    const ioi : IntersectionObserverInit = {
        threshold: threshold
    };
    self.observer = new IntersectionObserver(self.callback.bind(self), ioi);
    self.observer.observe(self);
}

const linkClonedTemplate = ({isVisible, exit, self}: LazyMT) => {
    if(!self.isCloned){
        const prev = self.previousElementSibling as HTMLTemplateElement;
        if(prev === null || prev.content === undefined) throw "No Template Found";
        const startRef = prev.previousElementSibling as LazyMT;
        if(startRef.localName !== LazyMT.is) throw "No Starting lazy-mt found.";
        self.startRef = new WeakRef(startRef);
    }
};
const propActions = [
    linkObserver,
    linkClonedTemplate
] as PropAction[];

const bool1: PropDef = {
    type: Boolean,
    dry: true,
    async: true,
    stopReactionsIfFalsy: true,
}
const bool2: PropDef = {
    type: Boolean,
    dry: true,
    async: true
}
const propDefMap: PropDefMap<LazyMT> = {
    threshold: {
        type: Number,
        reflect: true,
        dry: true,
        async: true,
    },
    enter: bool1,
    exit: bool1,
    isVisible: bool2,
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(LazyMT, slicedPropDefs.propDefs, 'onPropChange');
xc.define(LazyMT);