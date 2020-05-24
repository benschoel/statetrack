# statetrack

When your project is too small to justify a large framework, but too big for simple DOM handlers and manipulation, use statetrack to make your life easier. Create a central source of truth, and then listen to changes for specific attributes within that source of truth. All with less than 120 lines of code.

## Usage

-   Create a new state using the _statetrack_ function
-   Traverse through the state using calls to _source_
-   Each _source_ has functions like _set_ and _get_ and _listen_
-   Manipulate the DOM using _listen_, and manipulate the state using event listeners attached to DOM elements.

## Simple Example

```javascript
const statetrack = require("statetrack");

let state = statetrack({
    i: 0,
});

state.source("i").listen((val) => {
    console.log("The value of i is: " + val);
});

state.source("i").set(Math.floor(Math.random() * 100));
```

## Complex Example - Select

```javascript
const statetrack = require("statetrack");

let titleEl = document.querySelector("#title");
let optionsEl = document.querySelecto("#options");
let addBtnEl = document.querySelector("#add");

let state = statetrack({
    options: {},
    selected: "",
});

state.source("selected").listen(async (id) => {
    let options = await state.source("options").get();
    let selected = options[id] || "";
    titleEl.innerHTML = selected;
})

state.source("options").listen((options) => {
    optionsEl.innerHTML = "";

    for (const (key, option) of Object.entries(options)) {
        let el = document.createElement("li");
        el.innerHTML = option;
        el.addEventListener("click", () => {
            state.source("selected").set(key)
        })
        optionsEl.appendChild(el);
    }
});

addBtn.addEventListener("click", () => {
    let name = prompt("Name this option: ");
    if (!name) return;

    state.source("options").push(name);
});
```
