export interface LazyMTProps{
    cloned: boolean | undefined;
    threshold?: number | undefined;
    enter?: boolean | undefined;
    exit?: boolean | undefined;
    isVisible?: boolean | undefined;
    toggleDisabled?: boolean | undefined;
    mount?: boolean | undefined;
    minMem?: boolean | undefined;
    treatAsVisible: boolean | undefined;
    isStartVisible: boolean | undefined;
    startRef: WeakRef<LazyMT> | undefined;
}

export interface LazyMTActions {
    addIntersectionObserver(self: this): void;
    addStartRef(self: this): void;
    onTreatAsVisible(self: this): void;
    cloneAndMakeVisible(self: this): void;
    enableContent(self: this): void;
    disableContent(self: this): void;
    removeContent(self: this): void;
}

export interface LazyMT extends HTMLElement, LazyMTProps, LazyMTActions{}

type pl = Partial<LazyMTProps>;