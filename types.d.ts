export interface LazyMTProps extends HTMLElement{
    threshold?: number | undefined;
    enter?: boolean | undefined;
    exit?: boolean | undefined;
    isVisible?: boolean | undefined;
    toggleDisabled?: boolean | undefined;
    mount?: boolean | undefined;
    minMem?: boolean | undefined;
    treatAsVisible: boolean | undefined;
}