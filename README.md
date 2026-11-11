# X

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**X** is a tiny, chainable vanilla JavaScript library for DOM manipulation, event handling and simple single-page view switching. No dependencies, no build step, a single ES module.

It started as a small framework called *Element* and grew into a minimal helper for building interfaces with a fluent syntax.

---

## Features

- **Method chaining**: configure attributes, styles, classes, children and events in one statement.
- **Thin DOM wrapper**: over `document.createElement`, `classList`, `addEventListener` and friends. Always reachable through `.element`.
- **Safe by default**: text is inserted with `textContent`; `innerHTML` is only used when you explicitly call `.html()`.
- **Mini view router**: `Viewer` and `Link` switch views, optionally synced with `location.hash` so the browser back button works.
- **Accessible components**: `Link` renders a real `<a>`, and `Modal` has `role="dialog"`, `aria-modal` and closes with `Escape`.
- **Documented with JSDoc**: you get editor autocompletion. There is no TypeScript build or `.d.ts` file.

## Installation

There is no npm package yet. Copy `X.js` into your project and import it:

```javascript
import X, { $, x, Viewer, Link, Modal } from "./X.js";
```

Requires a browser (or jsdom) and ES modules.

## Quick start

### Creating and configuring elements

```javascript
const card = x("div", { class: "card", id: "main-card" })
  .setStyles({ padding: "20px", borderRadius: "8px" })
  .html("<h2>Hello from X!</h2>") // trusted markup only
  .addClass("fade-in")
  .hoverStyle("backgroundColor", "#ffffff", "#f0f0f0")
  .on("click", () => console.log("clicked"));

$("#app-root").appendChild(card);
```

`x(tag, attributes, styles, text)` is a shortcut for `new X().createElement(...)`.

### Selecting vs. creating

```javascript
$("#app");                              // wraps an EXISTING element (CSS selector)
$(document.body);                       // wraps an Element
x("p", { class: "lead" }, {}, "Hello"); // CREATES a new <p>
```

> `new X('div')` does **not** create a `<div>`: a string argument is a CSS selector passed to `querySelector`. Use `x('div')` or `new X().createElement('div')` to create elements.

### Views and navigation

```javascript
// Hash mode: the URL updates (#home, #about) and the back button works.
const viewer = new Viewer({ hash: true });

const home = x("section", { class: "view" }).html("<h1>Welcome</h1>").name("home");
const about = x("section", { class: "view" }).html("<h1>About us</h1>").name("about");

// Create links before primaryView() so the active one is highlighted.
const navHome = new Link(viewer, "Home", "home", "Go to Home");
const navAbout = new Link(viewer, "About", "about", "Go to About");

viewer.addViews(home, about).primaryView(home);

$("#navbar").append(navHome, navAbout);
$("#app").appendChild(viewer);
```

- Only the active view is attached to the DOM.
- The active link gets the `active` class and `aria-current="page"`.
- Without `{ hash: true }`, links switch views on click and the URL does not change.
- Per-view hooks: `view.onShow(() => ...)` and `view.onHide(() => ...)`.

### Modal

```javascript
const modal = new Modal("Confirm", x("p", {}, {}, "Are you sure?"));
modal.open(); // appended to document.body
modal.close(); // also closes on Escape, backdrop click or the ✕ button
```

`Modal` is styled with **Tailwind CSS utility classes**. Include Tailwind, or provide equivalent CSS for those classes.

## API reference

### `X`

| Method | Description |
| --- | --- |
| `constructor(element?)` | Wraps an `Element` or a CSS selector. |
| `createElement(tag, attributes?, styles?, text?)` | Creates a new element. `text` is inserted as plain text. |
| `setElement(element)` | Replaces the wrapped element (`Element` or selector). |
| `name(name)` | Sets the identifier used by `Viewer` / `Link`. |
| `setFather(parent)` | Appends this element to a parent (`X`, `Element` or selector). |
| `setAttribute(name, value)` / `setAttributes(obj)` | Sets one or many attributes. |
| `getAttribute(name)` | Reads the attribute directly from the DOM. |
| `setStyles(obj)` | Applies inline styles (camelCase keys). |
| `append(...children)` / `appendChild(child)` | Adds children: `X`, `Node` or string (as text). Arrays are accepted. |
| `remove(...children)` / `removeChild(child)` | Removes children (no error if already detached). |
| `empty()` | Removes all children. |
| `addClass(...)` / `removeClass(...)` / `toggleClass(cls, force?)` | Class helpers. |
| `on(event, fn, options?)` / `off(event, fn, options?)` | Event listeners. `off` needs the **same function reference** passed to `on`. |
| `hoverStyle(prop, default, hover)` | Sets a style on `mouseenter` and restores it on `mouseleave`. |
| `html(markup)` | Sets `innerHTML`. **Never use with untrusted input.** |
| `text(string)` | Sets `textContent` (safe). |
| `onShow(fn)` / `onHide(fn)` | Hooks called by a `Viewer`. |
| `destroy()` | Detaches from the DOM, removes tracked listeners and destroys children. |

Every method returns the instance, so calls can be chained. The raw DOM node is available as `.element`.

### `Viewer` (extends `X`)

- `new Viewer({ hash?: boolean })`
- `addView(view)` / `addViews(...views)`: registers views. Each one needs a name (`.name('home')`).
- `addLink(link)` / `addLinks(...links)`: registers links (done automatically by `Link`).
- `primaryView(view)`: registers and shows the default view (or the one in the URL hash).
- `showView(name)`: shows a view. Throws if the name is unknown.

### `Link` (extends `X`)

`new Link(viewer, text, viewName, title?, styles?)` renders `<a href="#viewName">`.

### `Modal` (extends `X`)

`new Modal(title, content)`, `.open(parent = document.body)`, `.close()`.

## Limitations

- No reactivity, state management or templating: X is a DOM helper, not a framework.
- Routing is hash-based only (`#name`). There are no nested routes, parameters or `history.pushState` paths.
- `children` only tracks `X` instances. Raw `Node`s and strings are appended to the DOM but not tracked.
- Needs a browser DOM. For tests, use jsdom.

## Upgrading from the first version

- The 4th argument of `x()` / `createElement()` is now **plain text**. For markup, call `.html(...)`.
- Name views with `.name('home')` instead of `view._name = 'home'` (the latter still works).
- `Modal` is no longer displayed on creation: call `.open()`.
- `Link` renders an `<a>` instead of a `<span>`. Update any CSS that targeted the `span`.

## License

MIT. Make sure a `LICENSE` file with the full MIT text is included in the repository.
