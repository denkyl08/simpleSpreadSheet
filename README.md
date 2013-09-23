simpleSpreadSheet
=================

A Javascript library for adding a flexible spreadsheet which has rows, columns and cells which grow and shrink with the contents

To initialize a table with ten rows and ten columns simple instantiate a table like so:

```javascript
Table({
  name: 'exampleTable',
  slot: 1,
  rows:10,
  columns:10,
})
```

The slot attribute is required. It refers to the HTML element in which the table will be inserted. element must have a class attribute of slot.

```html
<div id="slot1" class='slot'></div>
```

