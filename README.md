<a href="https://nodei.co/npm/lazy-mt/"><img src="https://nodei.co/npm/lazy-mt.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/lazy-mt">

# lazy-mt

lazy-mt ("lazy mount") is an alternative to [laissez-dom](https://github.com/bahrus/laissez-dom).  Like laissez-dom, it is assumed that some taxing content should only be added to the live DOM-tree when it becomes necessary -- namely when it becomes visible.  And optionally it should go to sleep (become disabled) when it rolls out of view.  Unlike laissez-dom, the "mt" DOM content (hee haw haw) tucked inside the template is expected to be sandwiched between two instances of lazy-mt:

```html
<lazy-mt enter mount></lazy-mt>
    <template>
        <w-butte-trail></w-butte-trail>
        <boddenburg-butte></boddenburg-butte>
        <reflection-lake-trail></reflection-lake-trail>
        <eklutna-lakeside-trail></eklutna-lakeside-trail>
        <twin-peaks-trail></twin-peaks-trail>
        <eska-falls></eska-falls>
    </template>
<lazy-mt exit mount></lazy-mt>
```

When either the enter or exit instance becomes visible, the template is cloned between the two tags (and the template is discarded).

Attribute "mount" is required in order to start watching for visibility.

When both lazy-mt tags leave the viewport, lazy-mt can set any elements to disabled, if attribute/property toggle-disabled/toggleDisabled is set/true.  So what you will see is:


```html
<lazy-mt enter mount toggle-disabled></lazy-mt>
<w-butte-trail disabled></w-butte-trail>
<boddenburg-butte disabled></boddenburg-butte>
<reflection-lake-trail disabled></reflection-lake-trail>
<eklutna-lakeside-trail disabled></eklutna-lakeside-trail>
<twin-peaks-trail disabled></twin-peaks-trail>
<eska-falls disabled></eska-falls>
<lazy-mt exit mount toggle-disabled></lazy-mt>
```

when either of the lazy-mt's lose visibility.

If attribute/property min-mem/minMem is set/true, then rather than discarding the template, it is held in memory, and the inner contents is deleted when  both "bookends" lose visibility.  This allows the inner content to be restored when it comes back in view (but state may be lost with this approach, so a strategy must be developed to restore state in this scenario).


