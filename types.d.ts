export interface LazyMTProps{
    checkedVisibility?: boolean;
    cloned?: boolean;
    enter?: boolean | undefined;
    exit?: boolean | undefined;
    isStartVisible: boolean | undefined;
    isVisible?: boolean | undefined;
    minMem?: boolean | undefined;
    mount?: boolean | undefined;
    startRef: WeakRef<LazyMT> | undefined;
    threshold?: number | undefined;
    toggleDisabled?: boolean | undefined;
    treatAsVisible: boolean | undefined;
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