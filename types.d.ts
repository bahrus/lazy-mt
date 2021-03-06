export interface LazyMTProps extends Partial<HTMLElement>{
    threshold?: number | undefined;
    enter?: boolean | undefined;
    exit?: boolean | undefined;
    isVisible?: boolean | undefined;
    toggleDisabled?: boolean | undefined;
}