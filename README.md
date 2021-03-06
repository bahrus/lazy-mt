# lazy-mt [TODO]

lazy-mt ("lazy mount") is an alternative to [laissez-dom](https://github.com/bahrus/laissez-dom).  Like laissez-dom, it is assumed that some taxing content should only be added to the live DOM-tree when it becomes necessary -- namely when it becomes visible.  And optionally it should go to sleep (become disabled) when it rolls out of view.  Unlike laissez-dom, the "mt" DOM content (hee haw haw) tucked inside the template is expected to be sandwiched between two instances of lazy-mt:

```html
<lazy-mt enter></lazy-mt>
    <template>
        <w-butte-trail></w-butte-trail>
        <boddenburg-butte></boddenburg-butte>
        <reflection-lake-trail></reflection-lake-trail>
        <eklutna-lakeside-trail></eklutna-lakeside-trail>
        <twin-peaks-trail></twin-peaks-trail>
        <eska-falls></eska-falls>
    </template>
<lazy-mt exit></lazy-mt>
```

When either the enter or exit instance becomes visible, the template is cloned between the two tags (and the template is discarded).

When both lazy-mt tags leave the viewport, lazy-mt can set the top most elements to be disabled if toggle-disabled attribute is present on the first lazy-mt tag.

