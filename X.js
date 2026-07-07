class X {
  /* @type {Element} */
  element;
  /* @type {string} */
  _name = null;
  /* @type {X} */
  father = null;
  /* @type {Object} */
  styles = {};
  /* @type {Object} */
  attributes = {};
  /* @type {Array} */
  children = [];
  
  /**
   * Constructor for the X class.
   *
   * @param {string|Element} [element] - The element to set as the current context. If not provided, the constructor will do nothing.
   * @throws {Error} - If the element is not provided or is not a string or an Element.
   * @example
   * const element = new X('div')
   * const anotherElement = new X('p')
   */
  constructor(element = null) {
    if (element) {
      this.setElement(element);
    } else {
      this.render();
    }
  }

  render() {
    return this;
  }

  /**
   * Creates a new element and sets it as the current context.
   *
   * @param {string} element - The element to create.
   * @param {Object} [attributes] - The attributes to set on the element. If not provided, no attributes will be set.
   * @param {Object} [styles] - The styles to set on the element. If not provided, no styles will be set.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div').createElement('p')
   * @throws {Error} - If the element is not provided or is not a string.
   */
  createElement(element, attributes = {}, styles = {}, text = "") {
    if (!element) {
      throw new Error("element is required");
    }

    if (typeof element !== "string") {
      throw new Error("element must be a string");
    }

    this.element = document.createElement(element);

    if (attributes) {
      this.setAttributes(attributes);
    }

    if (styles) {
      this.setStyles(styles);
    }

    if (text) {
      this.html(text);
    }

    return this;
  }

  /**
   * Sets the element of the current context.
   *
   * If the element is a HTMLElement, it will be used directly.
   * If the element is a string, it will be used as a CSS selector to find the element.
   * If the element is not found, an error will be thrown.
   * If the element is not a HTMLElement, an error will be thrown.
   *
   * @param {HTMLElement|string} element - The element to set as the current context.
   * @returns {X} - The current context.
   * @throws {Error} - If the element is not found.
   */
  setElement(element) {
    if (element instanceof HTMLElement) {
      this.element = element;
    } else if (typeof element === "string") {
      this.element = document.querySelector(element);
    }

    if (!this.element) {
      throw new Error("element not found");
    }

    return this;
  }

  /**
   * Sets the father of the current context.
   *
   * @param {X} father - The father to set.
   * @returns {X} - The current context.
   * @throws {Error} - If the father is not an instance of X.
   */
  setFather(father) {
    if (!father) {
      throw new Error("father is required");
    }

    if (typeof father === "string") {
      father = new X(father);
    } else if (!(father instanceof X)) {
      throw new Error("father must be an instance of X");
    }

    father.append(this);

    this.father = father;

    return this;
  }

  /**
   * Sets the attribute of the current context.
   *
   * @param {string} name - The attribute name.
   * @param {string} value - The attribute value.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.setAttribute('id', 'my-id')
   */
  setAttribute(name, value) {
    this.element.setAttribute(name, value);
    this.attributes[name] = value;
    return this;
  }

  /**
   * Sets the attributes of the current context.
   *
   * @param {Object} attributes - The attributes to set. The object should have the attribute name as the key and the attribute value as the value.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.setAttributes({
   *     id: 'my-id',
   *     class: 'my-class'
   * })
   */
  setAttributes(attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
      this.setAttribute(name, value);
    });
    return this;
  }

  /**
   * Sets the CSS styles of the current context.
   *
   * @param {Object} styles - The CSS styles to set. The object should have the CSS property name as the key and the CSS property value as the value.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.setStyles({
   *     color: 'red',
   *     fontSize: '2em'
   * })
   */
  setStyles(styles) {
    Object.entries(styles).forEach(([name, value]) => {
      this.element.style[name] = value;

      this.styles[name] = value;
    });
    return this;
  }

  /**
   * Appends a child element to the current context.
   *
   * @param {X} child - The child element to append.
   * @returns {X} - The current context.
   * @example
   * const parent = new X('div')
   * const child = new X('p')
   * parent.appendChild(child)
   */
  appendChild(child) {
    if (!child) {
      throw new Error("child is required");
    }

    if (!(child instanceof X)) {
      throw new Error("child must be an instance of X");
    }

    this.element.appendChild(child.element);

    this.children.push(child);

    return this;
  }

  /**
   * Removes a child element from the current context.
   *
   * @param {X} child - The child element to remove.
   * @returns {X} - The current context.
   * @example
   * const parent = new X('div')
   * const child = new X('p')
   * parent.removeChild(child)
   */
  removeChild(child) {
    if (!child) {
      throw new Error("child is required");
    }

    if (!(child instanceof X)) {
      throw new Error("child must be an instance of X");
    }

    this.element.removeChild(child.element);

    this.children = this.children.filter((c) => c !== child);

    return this;
  }

  /**
   * Manages children of the current context.
   *
   * @param {string} action - The action to perform on the children. It can be either "append" or "remove".
   * @param {X|X[]} children - The children to manage. If children is an instance of X, it will be managed as a single child. If children is an array of X, all children in the array will be managed.
   * @returns {X} - The current context.
   * @example
   * const parent = new X('div')
   * const child1 = new X('p')
   * const child2 = new X('p')
   * parent._manageChildren('append', [child1, child2])
   * parent._manageChildren('remove', child1)
   */
  _manageChildren(action, children) {
    const method = action === "append" ? "appendChild" : "removeChild";
    children.forEach((child) => this[method](child));
    return this;
  }

  /**
   * Appends one or more children to the current context.
   *
   * @param {X|X[]} children - The children to append. If children is an instance of X, it will be appended as a single child. If children is an array of X, all children in the array will be appended.
   * @returns {X} - The current context.
   * @example
   * const parent = new X('div')
   * const child1 = new X('p')
   * const child2 = new X('p')
   * parent.append(child1)
   * parent.append([child2])
   */
  append(...children) {
    return this._manageChildren("append", children);
  }

  /**
   * Removes one or more children from the current context.
   *
   * @param {X|X[]} children - The children to remove. If children is an instance of X, it will be removed as a single child. If children is an array of X, all children in the array will be removed.
   * @returns {X} - The current context.
   * @example
   * const parent = new X('div')
   * const child1 = new X('p')
   * const child2 = new X('p')
   * parent.remove(child1)
   * parent.remove([child2])
   */
  remove(...children) {
    return this._manageChildren("remove", children);
  }

  /**
   * Adds one or more classes to the current context.
   *
   * @param {string[]} classes - The classes to add.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.addClass('my-class')
   */

  addClass(...classes) {
    this.element.classList.add(...classes);
    return this;
  }

  /**
   * Removes one or more classes from the current context.
   *
   * @param {string[]} classes - The classes to remove.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.removeClass('my-class')
   */
  removeClass(...classes) {
    this.element.classList.remove(...classes);
    return this;
  }

  /**
   * Adds an event listener to the current context.
   *
   * @param {string} event - The event to listen for.
   * @param {function} callback - The callback function to call when the event is triggered.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.on('click', () => console.log('clicked'))
   */
  on(event, callback) {
    this.element.addEventListener(event, callback);
    return this;
  }

  /**
   * Removes an event listener from the current context.
   *
   * @param {string} event - The event to stop listening for.
   * @param {function} callback - The callback function to stop calling when the event is triggered.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.off('click', () => console.log('clicked'))
   */
  off(event, callback) {
    this.element.removeEventListener(event, callback);
    return this;
  }

  /**
   * Sets the hover style for the current context.
   *
   * @param {string} style - The CSS style to modify.
   * @param {string} defaultColor - The default color to set when the mouse is not over the element.
   * @param {string} hoverColor - The color to set when the mouse is over the element.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.hoverStyle('backgroundColor', 'white', 'gray')
   */
  hoverStyle(style, defaultColor, hoverColor) {
    this.element.addEventListener("mouseover", (e) => {
      e.target.style[style] = hoverColor;
    });
    this.element.addEventListener("mouseout", (e) => {
      e.target.style[style] = defaultColor;
    });
    return this;
  }

  /**
   * Sets the inner HTML of the current context.
   *
   * @param {string} html - The inner HTML to set.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.html('<p>Hello, world!</p>')
   */
  html(html) {
    this.element.innerHTML = html;
    return this;
  }

  /**
   * Sets the text content of the current context.
   *
   * @param {string} text - The text content to set.
   * @returns {X} - The current context.
   * @example
   * const element = new X('div')
   * element.text('Hello, world!')
   */
  text(text) {
    this.element.textContent = text;
    return this;
  }
}

const $ = (element) => new X(element);
const x = (element, attributes = {}, styles = {}, text = "") =>
  new X().createElement(element, attributes, styles, text);

class Viewer extends X {
  views = [];
  /**
   * Constructor for the $Viewer class.
   *
   * Sets the element of the current context to an article with the id "viewer".
   * Sets the inner html of the element to a heading element with the text "Viewer".
   */
  constructor() {
    super();
    this.createElement("article", { class: "viewer" });
  }

  _managerViewer(identifier, element) {
    let index = this.views.findIndex((view) => view.name === element._name);
    if (index === -1) {
      let viewIndex = this.views.push({ name: element._name, show: false });
      this.views[--viewIndex][identifier] = element;
    } else {
      this.views[index][identifier] = element;
    }
  }

  addView(view) {
    this._managerViewer("view", view);
    return this
  }

  primaryView(view) {
    this.addView(view);
    this.showView(view._name);
    return this
  }

  addLink(link) {
    this._managerViewer("link", link);
    return this
  }

  addViews(...views) {
    views.forEach((view) => this.addView(view));
    return this
  }

  addLinks(...links) {
    links.forEach((link) => this.addLink(link));
    return this
  }

  showView(name) {
    this.views.forEach((view, index) => {
      if (view.name === name && view.view) {
        this.appendChild(view.view);
        this.views[index].show = true;
      } else if (this.views[index].show) {
        this.removeChild(view.view);
        this.views[index].show = false;
      }
    });
    return this
  }
}

class Link extends X {
  constructor(viewer, text, href, title, styles = {}) {
    super();
    this.createElement("span", { href, title }, styles, text);

    this.setStyles({ cursor: "pointer" });

    this._name = href;

    viewer.addLink(this);

    this.on("click", () => {
      viewer.showView(this._name);
    });
  }
}

class Modal extends X {
  /**
   * @param {string} title - El título del Pop-up.
   * @param {string} textContent - El contenido de texto o HTML.
   */
  constructor(title, content) {
    super();

    // 1. Crear el contenedor principal (Fondo)
    this.createElement("div", {
      class:
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
    });

    // 2. Crear la caja del Pop-up y guardarla como propiedad para poder animarla luego
    this.modalBox = x("div", {
      class:
        "bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform scale-95 transition-all duration-300 ease-out",
    });

    // --- Construir las partes internas ---
    const header = x("div", {
      class:
        "px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center",
    });
    const titleEl = x(
      "h3",
      { class: "text-lg font-semibold text-gray-900" },
      {},
      title,
    );
    const closeCross = x(
      "button",
      { class: "text-gray-400 hover:text-gray-600 text-2xl font-semibold" },
      {},
      "&times;",
    );

    // 3. Ensamblar el componente
    header.append(titleEl, closeCross);

    this.modalBox.append(header, content);
    this.append(this.modalBox); // Añadimos la caja al contenedor principal (this)

    // 4. Asignar Eventos Internos
    closeCross.on("click", () => this.close());

    this.on("click", (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });
  }

  close() {
    this.father.remove(this);
    return this;
  }
}

export default X;
export { $, x, Viewer, Link, Modal };
