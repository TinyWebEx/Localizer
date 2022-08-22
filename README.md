# TinyWebEx Localizer

A tiny library that translates your HTML file with the WebExtension translation system. It's easy to use, and you only need to modify the HTML, everything else is done by this library.

## Features

* easy, but effective translation
* no JS setup needed
* allows (English) HTML [fallbacks](#fallbacks) in the HTML file, but does not require them
* does not translate whole document via string replacement, but relies on a proper HTML syntax
* properly sets the ["lang" attribute](https://developer.mozilla.org/docs/Web/HTML/Global_attributes/lang) [of your HTML tag](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-lang), so you can e.g. use the CSS [lang selector](https://developer.mozilla.org/docs/Web/CSS/:lang).
* supports [including sub-HTML elements in translations](#keeping-child-elements-in-HTML), so you do not need to use HTML replacements, but let translators dynamically place HTML elements such as links

## How to use?

To enable it, you just import the [`Localizer.js`](Localizer.js) module. Everything is done automatically, you do not need to call any JavaScript function or initialize something.

### HTML setup for internationalisation (i18n)

The real thing you need to do is to adjust your HTML. Actually, here is how it works:
* First, it always uses [data attributes](https://developer.mozilla.org/docs/Learn/HTML/Howto/Use_data_attributes). To avoid clashes there, it also always uses a prefix called `i18n`.
* As known from the WebExtension internationalisation API, you have to follow the [syntax `__MSG_translationName__`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Internationalization#Retrieving_localized_strings_in_manifests) as if you internationalize strings in your `manifest.json`.
* Add the `data-i18n` attribute to mark an element for translation. In the value of this attribute, you can specify the `__MSG_translationName__` and the library will translate the [`textContent`](https://developer.mozilla.org/docs/Web/API/Node/textContent) of it.
* To translate an attribute, you use the attribute `data-i18n-<attribute>` (e.g. `data-i18n-aria-alt`, `data-i18n-aria-label`) in the very same way. Instead of replacing the content of the HTML element though, it will now set/replace the attribute to this node.

**Note:** Remember, that even for translating only attributes, you need to add (an empty) attribute `data-i18n` to the HTML node. Otherwise it won't be detected and translated.

### Fallbacks

As translation strings are not specified in the user-facing content, i.e. e.g. text content, but in special attributes; you can fill the "original" places of these strings with fallbacks, e.g. to the English langauge.
That means, you can e.g. add `aria-label="error message" data-i18n data-i18n-aria-label="__MSG_errorMessage__"` and the `aria-label` will always show a valid label, even if it has not (yet) been loaded via JS.

Note, however, this is not required and you can easily leave it away, because [the WebExtension API includes an automatic fallback](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Internationalization#Localized_string_selection) and may thus fallback by itself. This of course also applies to the library here, so it will also set/replace the strings that you specify to translate, even if you e.g. hardcode translations.

### Example

```html
<!-- translate content, with hardcoded English fallback -->
<span data-i18n="__MSG_optionTranslationName__">
  This text here is just the English fallback that is always replaced if the system works properly and a translation entry for "optionTranslationName" is available. It may only appear for a short time, or if the JavaScript translation fails completly.
</span>

<!-- translate only attributes, no hardcoded fallback -->
<div class="icon-dismiss" data-i18n data-i18n-aria-label="__MSG_dismissIconDescription__">

<!-- translate only attributes, with hardcoded English fallback -->
<div class="icon-dismiss" data-i18n aria-label="close" data-i18n-aria-label="__MSG_dismissIconDescription__">

<!-- translate content and attributes, with hardcoded English fallback -->
<a data-i18n="__MSG_optionLearnMore__" data-i18n-href="__MSG_optionErrorCorrectionDescrLink__" href="https://en.wikipedia.org/wiki/QR_code#Error_correction">Learn more</a>
```

### Localisation (l10n)

As mentioned, it uses the WebExtension translation system, so you [just add the strings to translate to your `messages.json`](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Internationalization#Providing_localized_strings_in__locales).

For translators, it is also useful to include a small guide in your contributing guide, such as [ours here](https://github.com/TinyWebEx/common/blob/contribimprove/CONTRIBUTING.md#internationalisation-of-html-files).

### Using HTML in translations

**Important:** By default you can only include plain text in your translations. HTML translations are disabled by default for security reasons!

_Instead_ of using HTML it is strongly suggested to use [the child-keeping method explained below](#keeping-child-elements-in-HTML).

Whether HTML translations are enabled depends on one source code file in this repo, i.e. [`replaceInnerContent.js`](replaceInnerContent.js). The reason for this is that [the linting tool](https://github.com/mozilla/addons-linter) used on addons.mozilla.org (AMO) otherwise complains about a potential security issue if HTML translations are enabled. This results in a warning when uploading the add-on to AMO as the HTML version makes use of `innerHtml` in the JavaScript file.

If you want to enable HTML translations though, you need to:
* Replace/Add the file `replaceInnerContent.js` with (the content of) [`replaceInnerContent.js.InsecureWithHtml.example`](replaceInnerContent.js.InsecureWithHtml.example).
* All the translation strings that should be parsed as HTML have to include the marker `!HTML!` (and an optional space afterwards, that will be trimmed) in front of the text.

So a sentence could look like this:
```json
"boldSentence": {
  "message": "!HTML! <b>This sentence is bold.</b>"
}
```

This can also explained in short for [translators in the contributing guide](https://github.com/TinyWebEx/common/blob/10ff5cace217841591d702408e64f1ead8c26a64/CONTRIBUTING.md#using-html-in-translations) (permalink, as I now discourage using that feature, anyway).

**Warning:** If you allow/use HTML translation, note that translators could inject malicious (HTML) code then. As such, you need to take care when reviewing the translation files then. The marker `!HTML!` can help you here as you can just search for it.

### Keeping child elements in HTML

By default, this module just replaces the whole text/content of an HTML tag.
A common use case is that you may need to include different sub-HTML items (children of the HTML parent) in your translation however. Especially, you may want to allow translators to adjust their position in the translation.
This is e.g. useful when you want to include links in your translation. 

To do so, you just need to add `data-opt-i18n-keep-children` to the HTML parent that needs to be translated this way. It will then:
* put all HTML tags into a substitutions (`$1`, `$2`, …), which you can use to refer to your content in the translation
* translate only the actual text content and adjust the position/ordering of the HTML tags, so they meet the translation result

In the end, you e.g. can have a translation like this:
```json
"parent": {
  "message": "Check out $LINK$!",
  "description": "The text shown.",
  "placeholders": {
    "link": {
      "content": "$1",
      "example": "<a href=\"https://example.com\">for more details</a>"
    }
  }
},
"link": {
  "message": "https://example.com",
  "description": "The link location."
},
"linkText": {
  "message": "for more details",
  "description": "The text shown for the link."
},
```

The corresponding HTML code is the following one:

```html
<p data-i18n="__MSG_parent__" data-opt-i18n-keep-children>
  Check out <a data-i18n="__MSG_linkText__" data-i18n-href="__MSG_link__" href="https://example.com">for more details</a>!
</p>
```

As you can, see in the example `$1` will be replaced with the `a` tag for the link. As you can see, obviously, you need to translate the `a` tag as usual, too, and thus you just use the same principles as usual.
It does also keep the HTML item intact and just move it, it will never be removed from the DOM and you can thus just use it as every other HTML tag.
You should also be able to nest this feature, as you want.

**Note:** If you use this feature, you should make sure your translations also actually also refer to the HTML tag (the substitution) via `$1`, `$2` etc.
If they don't, the Localizer does not know where to put the HTML tag and it usually is just placed at the end. As said, it does never delete a HTML tag, so it just stays "in place" then.
