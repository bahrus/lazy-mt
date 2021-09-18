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

    addIntersectionObserver = ({threshold}: this) => {
        if(this.#observer !== undefined) this.#observer.disconnect();
        const ioi : IntersectionObserverInit = {
            threshold
        };
        this.#observer = new IntersectionObserver(this.callback, ioi);
        this.#observer.observe(this);
        setTimeout(() => {
            this.checkVisibility(this);
        }, 50);
    };

    onTreatAsVisible = ({}: this) =>({
        isVisible: true,
        checkedVisibility: true,
    });


    addStartRef = ({previousElementSibling, isStartVisible}: this) => {
        const prev = previousElementSibling! as HTMLTemplateElement;
        if(prev === null || prev.content === undefined) throw "No Template Found";
        const startRef = prev.previousElementSibling as LazyMTCore;
        if(startRef.localName !== tagName) throw "No Starting lazy-mt found.";
        
        startRef.addEventListener('is-visible-changed', e => {
            isStartVisible = (<any>e).detail.value;
        });
        return {
            startRef: new WeakRef<LazyMTProps>(startRef),
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
    checkVisibility(self: this){
        self.isVisible = isElementInViewport(this);
        self.checkedVisibility = true;
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
    
    removeContent = ({entry}: this) => {
        this.cloned = false;
        const range = new Range();
        range.setStart(entry as any as Node, 0);
        range.setEnd(this, 0);
        range.deleteContents();
    }

    cloneAndMakeVisible = ({entry, previousElementSibling, minMem}: this) => {
        const prev = this.#templateRef || previousElementSibling as HTMLTemplateElement;
        insertAdjacentTemplate(prev, entry as any as Element, 'afterend');
        if(minMem && this.#templateRef === undefined){
            this.#templateRef = prev;
        }else{
            prev.remove();
        }
         //TODO support deleting materialized content
        this.cloned = true;
        entry.cloned = true;
    }

    enableContent = ({entry}: this) => {
        this.#doToggleDisabled(this, entry as any as HTMLElement, this, false);
    }

    disableContent = ({entry}: this) => {
        this.#doToggleDisabled(this, entry as any as HTMLElement, this, true);
    }

    get entry(){
        const entry = this.startRef!.deref();
        if(entry === undefined) throw "No starting lazy-mt found.";
        return entry;
    }

    disconnectedCallback(){
        if(this.#observer !== undefined) this.#observer.disconnect();
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
            checkedVisibility: false,
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
        propInfo:{
            isVisible:{
                notify:{dispatch:true}
            }
        },
        actions:{
            addIntersectionObserver:{
                ifAllOf: ['mount'],
                ifNoneOf: ['treatAsVisible'],
                ifKeyIn: ['threshold']
            },
            addStartRef:{
                ifAllOf: ['exit']
            },
            onTreatAsVisible:{
                ifAllOf: ['treatAsVisible']
            },
            cloneAndMakeVisible:{
                ifAllOf: ['exit', 'startRef', 'checkedVisibility', 'mount'],
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
                ifNoneOf: ['isVisible', 'isStartVisible'],
                ifAllOf: ['minMem', 'checkedVisibility']
            }

        }
    },
    superclass: LazyMTCore
});
