import {XE} from 'xtal-element/src/XE.js';
import {LazyMTActions, LazyMTProps} from './types.js';
import {nudge} from 'xtal-element/lib/nudge.js';
import {zzz} from 'xtal-element/lib/zzz.js';
import {insertAdjacentTemplate} from 'trans-render/lib/insertAdjacentTemplate.js';

/**
 * @element lazy-mt
 * @tag lazy-mt
 */
export class LazyMTCore extends HTMLElement implements LazyMTActions{

    #observer: IntersectionObserver | undefined;
    
    
    
    #templateRef: HTMLTemplateElement | undefined;
    addIntersectionObserver(self: this){
        const {threshold} = self;
        if(self.#observer !== undefined) self.#observer.disconnect();
        const ioi : IntersectionObserverInit = {
            threshold
        };
        self.#observer = new IntersectionObserver(self.callback, ioi);
        self.#observer.observe(self);
        setTimeout(() => {
            self.checkVisibility();
        }, 500);
    }

    onTreatAsVisible(self: this){
        self.isVisible = true;
    }


    addStartRef(self: this){
        const prev = self.previousElementSibling as HTMLTemplateElement;
        if(prev === null || prev.content === undefined) throw "No Template Found";
        const startRef = prev.previousElementSibling as LazyMTCore;
        if(startRef.localName !== tagName) throw "No Starting lazy-mt found.";
        
        startRef.addEventListener('is-visible-changed', e => {
            self.isStartVisible = (<any>e).detail.value;
        });
        return {
            startRef: new WeakRef(startRef),
        }
    }

    callback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        for(const entry of entries){
            if(entry.intersectionRatio > 0){
                this.isVisible = true;
                return;
            }
        }
        this.isVisible = false;
    }
    checkVisibility(){
        this.isVisible = isElementInViewport(this);
    }

    #doToggleDisabled(self: this, start: HTMLElement, end: HTMLElement, val: boolean): void{
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
    
    removeContent(self: this){
        self.cloned = false;
        const range = new Range();
        range.setStart(self.entry, 0);
        range.setEnd(self, 0);
        range.deleteContents();
    }

    cloneAndMakeVisible(self: this){
        const {entry} = self;
        const prev = self.#templateRef || self.previousElementSibling as HTMLTemplateElement;
        insertAdjacentTemplate(prev, self.entry, 'afterend');
        if(self.minMem && self.#templateRef === undefined){
            self.#templateRef = prev;
        }else{
            prev.remove();
        }
         //TODO support deleting materialized content
        self.cloned = true;
        entry.cloned = true;
    }

    enableContent(self: this){
        self.#doToggleDisabled(self, self.entry, self, false);
    }

    disableContent(self: this){
        self.#doToggleDisabled(self, self.entry, self, true);
    }

    get entry(){
        const entry = this.startRef!.deref();
        if(entry === undefined) throw "No starting lazy-mt found.";
        return entry;
    }


}

export interface LazyMTCore extends LazyMTProps{}

function isElementInViewport (el: Element) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

const tagName = 'lazy-mt';

const xe = new XE<LazyMTProps, LazyMTActions>();
xe.def({
    config:{
        tagName,
        propDefaults:{
            threshold: 0,
            enter: false,
            exit: false,
            isVisible: false,
            cloned: false,
            mount: false,
            minMem: false,
            toggleDisabled: false,
            treatAsVisible: false,            
        },
        actions:{
            addIntersectionObserver:{
                ifAllOf: ['mount'],
                ifNoneOf: ['treatAsVisible'],
                actIfKeyIn: ['threshold']
            },
            addStartRef:{
                ifAllOf: ['exit']
            },
            onTreatAsVisible:{
                ifAllOf: ['treatAsVisible']
            },
            cloneAndMakeVisible:{
                ifAllOf: ['exit', 'startRef'],
                ifAtLeastOneOf: ['isVisible', 'isStartVisible'],
                ifNoneOf: ['cloned'],
            },
            enableContent:{
                ifAtLeastOneOf: ['isVisible', 'isStartVisible', 'startRef'],
                ifAllOf: ['cloned', 'exit'],
                ifNoneOf: ['minMem']
            },
            disableContent:{
                ifNoneOf: ['isVisible', 'isStartVisible', 'minMem', 'startRef'],
                ifAllOf: ['cloned', 'exit'],
            },
            removeContent:{
                ifNoneOf: ['isVisible', 'isStartVisible', 'startRef'],
                ifAllOf: ['minMem']
            }

        }
    },
    superclass: LazyMTCore
});
