/**
 * X — lightweight, chainable vanilla JS DOM helper with a tiny view router.
 */
class X {
  /** @type {Element} */
  element;
  /** @type {string|null} */
  _name = null;
  /** @type {X|null} */
  father = null;
  /** @type {Object} */
  styles = {};
  /** @type {X[]} */
  children = [];
  /** @type {Array<[string, Function, Function]>} tracked listeners: [event, original, bound] */
  _listeners = [];
  /** @type {Function|null} */
  _onShow = null;
  /** @type {Function|null} */
  _onHide = null;

  /**
   * Wraps an existing element or CSS selector. Without arguments, nothing is
   * wrapped yet (use `createElement` afterwards).
   *
   * NOTE: a string is a CSS *selector* (querySelector), not a tag name.
   * To create a new element use `new X().createElement('div')` or `x('div')`.
   *
   * @param {string|Element} [element]
   * @throws {Error} If the selector matches nothing or the value is invalid.
   * @example
   * const app = new X('#app')
   */
  constructor(element = null) {
    if (element) this.setElement(element);
  }

  /**
   * Creates a new element and sets it as the current context.
   * `text` is inserted as plain text (safe). Use `.html()` for markup.
   *
   * @param {string} tag
   * @param {Object} [attributes]
   * @param {Object} [styles]
   * @param {string} [text]
   * @returns {X}
   * @example
   * const p = new X().createElement('p', { class: 'lead' }, {}, 'Hello')
   */
  createElement(tag, attributes = {}, styles = {}, text = "") {
    if (!tag) throw new Error("tag is required");
    if (typeof tag !== "string") throw new Error("tag must be a string");

    this.element = document.createElement(tag);

    if (attributes) this.setAttributes(attributes);
    if (styles) this.setStyles(styles);
    if (text) this.text(text);

    return this;
  }

  /**
   * Sets the wrapped element (Element or CSS selector).
   *
   * @param {Element|string} element
   * @returns {X}
   * @throws {Error} If not found or invalid.
   */
  setElement(element) {
    if (element instanceof Element) {
      this.element = element;
    } else if (typeof element === "string") {
      this.element = document.querySelector(element);
    } else {
      throw new Error("element must be a selector string or an Element");
    }

    if (!this.element) throw new Error("element not found");
    return this;
  }

  /**
   * Sets an identifier (used by Viewer / Link).
   *
   * @param {string} name
   * @returns {X}
   */
  name(name) {
    this._name = name;
    return this;
  }

  /**
   * Appends this element to a parent (X, Element or selector).
   *
   * @param {X|Element|string} father
   * @returns {X}
   */
  setFather(father) {
    if (!father) throw new Error("father is required");

    if (typeof father === "string" || father instanceof Element) {
      father = new X(father);
    } else if (!(father instanceof X)) {
      throw new Error("father must be an X, an Element or a selector");
    }

    father.appendChild(this);
    return this;
  }

  /**
   * @param {string} name
   * @param {string} value
   * @returns {X}
   */
  setAttribute(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  /**
   * Reads the attribute straight from the DOM (never stale).
   *
   * @param {string} name
   * @returns {string|null}
   */
  getAttribute(name) {
    return this.element.getAttribute(name);
  }

  /**
   * @param {Object} attributes
   * @returns {X}
   */
  setAttributes(attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
      this.setAttribute(name, value);
    });
    return this;
  }

  /**
   * @param {Object} styles - camelCase properties, e.g. { fontSize: '2em' }
   * @returns {X}
   */
  setStyles(styles) {
    Object.entries(styles).forEach(([name, value]) => {
      this.element.style[name] = value;
      this.styles[name] = value;
    });
    return this;
  }

  /**
   * Appends a child. Accepts X, Element or string (inserted as text).
   *
   * @param {X|Element|string} child
   * @returns {X}
   */
  appendChild(child) {
    if (child === null || child === undefined || child === "") {
      throw new Error("child is required");
    }

    if (child instanceof X) {
      if (child.father && child.father !== this) child.father.removeChild(child);
      this.element.appendChild(child.element);
      if (!this.children.includes(child)) this.children.push(child);
      child.father = this;
    } else if (child instanceof Node) {
      this.element.appendChild(child);
    } else if (typeof child === "string") {
      this.element.appendChild(document.createTextNode(child));
    } else {
      throw new Error("child must be an X, a Node or a string");
    }

    return this;
  }

  /**
   * Removes a child. No error if it is already detached.
   *
   * @param {X|Element} child
   * @returns {X}
   */
  removeChild(child) {
    if (!child) throw new Error("child is required");

    if (child instanceof X) {
      if (child.element.parentNode === this.element) {
        this.element.removeChild(child.element);
      }
      this.children = this.children.filter((c) => c !== child);
      if (child.father === this) child.father = null;
    } else if (child instanceof Node) {
      if (child.parentNode === this.element) this.element.removeChild(child);
    } else {
      throw new Error("child must be an X or a Node");
    }

    return this;
  }

  _manageChildren(action, children) {
    const method = action === "append" ? "appendChild" : "removeChild";
    children.flat().forEach((child) => this[method](child));
    return this;
  }

  /**
   * @param {...(X|Element|string|Array)} children
   * @returns {X}
   * @example
   * parent.append(a, b)
   * parent.append([a, b])
   */
  append(...children) {
    return this._manageChildren("append", children);
  }

  /**
   * @param {...(X|Element|Array)} children
   * @returns {X}
   */
  remove(...children) {
    return this._manageChildren("remove", children);
  }

  /**
   * Removes every child.
   *
   * @returns {X}
   */
  empty() {
    [...this.children].forEach((c) => this.removeChild(c));
    this.element.textContent = "";
    return this;
  }

  /**
   * @param {...string} classes
   * @returns {X}
   */
  addClass(...classes) {
    this.element.classList.add(...classes);
    return this;
  }

  /**
   * @param {...string} classes
   * @returns {X}
   */
  removeClass(...classes) {
    this.element.classList.remove(...classes);
    return this;
  }

  /**
   * @param {string} cls
   * @param {boolean} [force]
   * @returns {X}
   */
  toggleClass(cls, force) {
    this.element.classList.toggle(cls, force);
    return this;
  }

  /**
   * Adds an event listener (tracked so `destroy()` can clean it).
   *
   * @param {string} event
   * @param {Function} callback
   * @param {AddEventListenerOptions|boolean} [options]
   * @returns {X}
   */
  on(event, callback, options) {
    this.element.addEventListener(event, callback, options);
    this._listeners.push([event, callback, options]);
    return this;
  }

  /**
   * Removes a listener. Pass the SAME function reference used in `on()`
   * (anonymous functions cannot be removed).
   *
   * @param {string} event
   * @param {Function} callback
   * @param {AddEventListenerOptions|boolean} [options]
   * @returns {X}
   */
  off(event, callback, options) {
    this.element.removeEventListener(event, callback, options);
    this._listeners = this._listeners.filter(
      ([e, cb]) => !(e === event && cb === callback),
    );
    return this;
  }

  /**
   * Sets a style on mouse enter and restores it on mouse leave.
   *
   * @param {string} style - camelCase CSS property.
   * @param {string} defaultValue
   * @param {string} hoverValue
   * @returns {X}
   * @example
   * el.hoverStyle('backgroundColor', 'white', 'gray')
   */
  hoverStyle(style, defaultValue, hoverValue) {
    this.on("mouseenter", () => (this.element.style[style] = hoverValue));
    this.on("mouseleave", () => (this.element.style[style] = defaultValue));
    return this;
  }

  /**
   * Sets innerHTML. ⚠️ Never pass untrusted input; use `text()` instead.
   *
   * @param {string} html
   * @returns {X}
   */
  html(html) {
    this.element.innerHTML = html;
    return this;
  }

  /**
   * Sets textContent (safe).
   *
   * @param {string} text
   * @returns {X}
   */
  text(text) {
    this.element.textContent = text;
    return this;
  }

  /**
   * Hook called when this X is shown by a Viewer.
   *
   * @param {Function} fn
   * @returns {X}
   */
  onShow(fn) {
    this._onShow = fn;
    return this;
  }

  /**
   * Hook called when this X is hidden by a Viewer.
   *
   * @param {Function} fn
   * @returns {X}
   */
  onHide(fn) {
    this._onHide = fn;
    return this;
  }

  /**
   * Detaches from the DOM, removes tracked listeners and destroys children.
   *
   * @returns {X}
   */
  destroy() {
    [...this.children].forEach((c) => c.destroy());
    this._listeners.forEach(([e, cb, opt]) =>
      this.element.removeEventListener(e, cb, opt),
    );
    this._listeners = [];
    if (this.father) this.father.removeChild(this);
    else this.element.remove();
    return this;
  }
}

const $ = (element) => new X(element);
const x = (tag, attributes = {}, styles = {}, text = "") =>
  new X().createElement(tag, attributes, styles, text);

/**
 * Minimal view manager. Only the active view is attached to the DOM.
 * With `{ hash: true }` it syncs with `location.hash` (back button works).
 */
class Viewer extends X {
  /** @type {Array<{name: string, view?: X, link?: X}>} */
  views = [];
  /** @type {string|null} */
  current = null;
  /** @type {string|null} */
  _primary = null;

  /**
   * @param {{hash?: boolean}} [options]
   */
  constructor({ hash = false } = {}) {
    super();
    this.createElement("article", { class: "viewer" });
    this.hash = hash;

    if (hash) {
      this._onHashChange = () => {
        const name = decodeURIComponent(location.hash.slice(1));
        if (this._find(name)?.view) this.showView(name);
        else if (this._primary) this.showView(this._primary);
      };
      window.addEventListener("hashchange", this._onHashChange);
    }
  }

  _find(name) {
    return this.views.find((v) => v.name === name);
  }

  _managerViewer(identifier, element) {
    if (!element._name) {
      throw new Error("view/link needs a name (use .name('...'))");
    }
    let entry = this._find(element._name);
    if (!entry) {
      entry = { name: element._name };
      this.views.push(entry);
    }
    entry[identifier] = element;
  }

  addView(view) {
    this._managerViewer("view", view);
    return this;
  }

  addViews(...views) {
    views.flat().forEach((v) => this.addView(v));
    return this;
  }

  addLink(link) {
    this._managerViewer("link", link);
    return this;
  }

  addLinks(...links) {
    links.flat().forEach((l) => this.addLink(l));
    return this;
  }

  /**
   * Registers the default view and shows it (or the one in the URL hash).
   *
   * @param {X} view
   * @returns {Viewer}
   */
  primaryView(view) {
    this.addView(view);
    this._primary = view._name;
    const fromHash = this.hash
      ? decodeURIComponent(location.hash.slice(1))
      : null;
    this.showView(fromHash && this._find(fromHash)?.view ? fromHash : view._name);
    return this;
  }

  /**
   * @param {string} name
   * @returns {Viewer}
   * @throws {Error} If no view has that name.
   */
  showView(name) {
    const target = this._find(name);
    if (!target || !target.view) {
      throw new Error(`view "${name}" not found`);
    }
    if (this.current === name) return this;

    const previous = this.current ? this._find(this.current) : null;
    if (previous) {
      this.removeChild(previous.view);
      previous.view._onHide?.();
      previous.link?.removeClass("active").element.removeAttribute("aria-current");
    }

    this.appendChild(target.view);
    this.current = name;
    target.link?.addClass("active").setAttribute("aria-current", "page");
    target.view._onShow?.();

    if (this.hash && decodeURIComponent(location.hash.slice(1)) !== name) {
      location.hash = encodeURIComponent(name);
    }

    return this;
  }

  destroy() {
    if (this._onHashChange) {
      window.removeEventListener("hashchange", this._onHashChange);
    }
    return super.destroy();
  }
}

/**
 * Accessible navigation link bound to a Viewer view.
 * Renders `<a href="#name">`.
 */
class Link extends X {
  /**
   * @param {Viewer} viewer
   * @param {string} text
   * @param {string} href - name of the target view.
   * @param {string} [title]
   * @param {Object} [styles]
   */
  constructor(viewer, text, href, title, styles = {}) {
    super();
    this.createElement(
      "a",
      { href: `#${encodeURIComponent(href)}`, ...(title ? { title } : {}) },
      { cursor: "pointer", ...styles },
      text,
    );

    this._name = href;
    viewer.addLink(this);

    // In hash mode the native anchor navigation + hashchange does the work.
    if (!viewer.hash) {
      this.on("click", (e) => {
        e.preventDefault();
        viewer.showView(this._name);
      });
    }
  }
}

/**
 * Modal dialog. ⚠️ Styled with Tailwind utility classes: include Tailwind
 * (or provide equivalent CSS) for it to look right.
 */
class Modal extends X {
  /**
   * @param {string} title - plain text.
   * @param {X|Element|string} content
   */
  constructor(title, content) {
    super();
    this.createElement("div", {
      class:
        "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
    });

    const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

    const dialog = x("div", {
      class:
        "bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
    });

    const header = x("div", {
      class: "flex justify-between items-center px-6 py-4 border-b",
    }).append(
      x("h3", { class: "text-lg font-bold text-gray-800", id: titleId }, {}, title),
      x(
        "button",
        {
          type: "button",
          "aria-label": "Close",
          class: "text-gray-400 hover:text-gray-600 text-xl font-bold p-1",
        },
        {},
        "✕",
      ).on("click", (e) => {
        e.stopPropagation();
        this.close();
      }),
    );

    const body = x("div", { class: "p-6" }).append(content);
    dialog.append(header, body);
    this.append(dialog);

    // Close when clicking the backdrop
    this.on("click", (e) => {
      if (e.target === this.element) this.close();
    });

    this._onKeydown = (e) => {
      if (e.key === "Escape") this.close();
    };
  }

  /**
   * Attaches the modal to the page (document.body by default).
   *
   * @param {Element} [parent]
   * @returns {Modal}
   */
  open(parent = document.body) {
    parent.appendChild(this.element);
    document.addEventListener("keydown", this._onKeydown);
    return this;
  }

  /**
   * Removes the modal from the page.
   *
   * @returns {Modal}
   */
  close() {
    document.removeEventListener("keydown", this._onKeydown);
    this.element.remove();
    return this;
  }
}

export default X;
export { $, x, Viewer, Link, Modal };
