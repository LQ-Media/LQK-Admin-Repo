# Header — Login + Register grouped on the right

`sections/lqk-header.liquid`

## Problem

`.hdr` is `display:flex` with `justify-content:space-between`, and Login and
Register were two **separate** flex children alongside the brand and the nav:

```
brand        nav        [Login]        [Register]
```

`space-between` distributes free space evenly *between every child*, so the two
buttons were pushed apart — Login ended up floating in the middle-right rather
than sitting beside Register.

## Change

Wrap the two in a single `.actions` element so flex sees **one** child on the
right, and the buttons sit together inside it:

```
brand        nav                [Login] [Register]
```

CSS added:

```css
.lqk-header-{{ section.id }} .actions{
  display:flex;align-items:center;gap:10px;margin-left:auto;flex-shrink:0;
}
```

Markup — the account link and the CTA moved inside the wrapper:

```liquid
<div class="actions">
  {% if section.settings.show_account %}
    <a class="acct" href="...">... {% if customer %}My account{% else %}Login{% endif %}</a>
  {% endif %}
  <a class="lqk-btn lqk-btn--primary cta" href="...">{{ section.settings.cta_text }}</a>
</div>
```

The mobile breakpoint collapsed from two rules to one, since the pair is now a
single element:

```css
/* before */
@media (max-width: 900px){ .cta{display:none} .acct{display:none} }
/* after  */
@media (max-width: 900px){ .actions{display:none} }
```

Under 900px the burger menu still takes over, unchanged. `gap:10px` keeps the
two buttons visually paired without touching; `flex-shrink:0` stops them
squashing when the nav is long.

Note: "Register" here is the existing header CTA (`cta_text`, currently
"Register 2026"), not the Shopify account-creation route. Point `cta_link` at
`/account/register` if account signup is what it should do.
