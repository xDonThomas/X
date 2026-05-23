# 📦 X — Lightweight Vanilla JS DOM Manipulation & Routing Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[cite_start]**X** is an ultra-lightweight, fluent, and chainable Vanilla JavaScript library designed to simplify DOM manipulation, event handling, and single-page view routing without the overhead of heavy frameworks. 

[cite_start]Originally conceived as a custom framework called *Element*, it has evolved into an intuitive tool for building reactive user interfaces quickly using clean syntax[cite: 22, 23, 25].

---

## ✨ Key Features

- ⛓️ **Method Chaining:** Fluent API design that allows you to configure attributes, styles, classes, and events in a single continuous statement.
- 🛠️ **Seamless DOM Utility:** Simple API abstraction over `document.createElement`, class management, and hover states.
- 🗺️ **Built-in SPA Viewer:** Includes a lightweight view-manager components (`Viewer` and `Link`) to handle basic client-side view switching out of the box.
- 📘 **Self-Documented:** Fully typed and documented using JSDoc guidelines for clear IDE autocompletion.

---

## 🚀 Installation & Quick Start

Simply export and import the module into your modern JavaScript project:

```javascript
import X, { $, Viewer, Link } from './X.js';
```

### 1. Basic DOM Manipulation & Chaining
You can instantiate a new wrapper context or hook into an existing CSS selector using the $ alias:

```javascript
// Create and configure a new element fluently
const modernCard = new X()
  .createElement('div', { class: 'card-container', id: 'main-card' })
  .setStyles({ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' })
  .html('<h2>Hello from X!</h2>')
  .addClass('fade-in')
  .hoverStyle('backgroundColor', '#ffffff', '#f0f0f0');

// Append to an existing element in the DOM
$('#app-root').appendChild(modernCard);
```

### 2. Lightweight Single-Page View Management (Viewer)
Easily manage client-side navigation without downloading heavy router libraries:

```javascript
// 1. Initialize the main View container
const appViewer = new Viewer();

// 2. Create your isolated views (X instances)
const homeView = new X().createElement('section', { class: 'view' }).html('<h1>Welcome Home</h1>');
homeView._name = 'home';

const aboutView = new X().createElement('section', { class: 'view' }).html('<h1>About Us</h1>');
aboutView._name = 'about';

// 3. Register views and set the primary interface
appViewer.addViews(homeView, aboutView);
appViewer.primaryView(homeView); // Displays home by default

// 4. Instantiate navigation controls linked to the Viewer
const navHome = new Link(appViewer, 'Go to Home', 'home', 'Home Link');
const navAbout = new Link(appViewer, 'Go to About', 'about', 'About Link');

// Render layout
$('#navbar').append(navHome, navAbout);
$('#app').appendChild(appViewer);
```

## API Reference Overview
### ```X``` Class (Core Component)
- ```constructor(element)```: Hooks to an existing DOM string selector or wraps an HTMLElement.

- ```createElement(tagName, attributes, styles, text)```: Instantiates a new underlying DOM node.

- ```setStyles(styles)``` / ```setAttributes(attributes)```: Bulk applies inline styles or DOM attributes via objects.

- ```append(...children)``` / ```remove(...children)```: Handles bulk injection or extraction of child nodes.

- ```on(event, callback)``` / ```off(event, callback)```: Wraps native event listeners.

- ```hoverStyle(cssProperty, defaultVal, hoverVal)```: Easily setups automatic tracking for hover states.

### ```Viewer``` Class (Extends X)
- Actively manages views registry array. Switches visible nodes automatically while detaching inactive elements to maintain a lightweight DOM tree.

## 📜 License
This project is open-source and available under the MIT License.
