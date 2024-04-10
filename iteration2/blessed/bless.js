import blessed from 'blessed';

// Function to create a button with specified options
function createButton(options) {
  return blessed.button({
    ...options.style,
    ...options,
  });
}

// Function to create a form with specified options
function createForm(options) {
  return blessed.form({
    ...options.style,
    ...options,
  });
}

// Main code
const screen = blessed.screen();

const form = createForm({
  parent: screen,
  keys: true,
  left: 0,
  top: 0,
  width: 30,
  height: 4,
  bg: 'green',
  content: 'Submit or cancel?',
});

const submit = createButton({
  parent: form,
  mouse: true,
  keys: true,
  shrink: true,
  padding: {
    left: 1,
    right: 1,
  },
  left: 10,
  top: 2,
  shrink: true,
  name: 'submit',
  content: 'submit',
  style: {
    bg: 'blue',
    focus: {
      bg: 'red',
    },
    hover: {
      bg: 'red',
    },
  },
});

const cancel = createButton({
  parent: form,
  mouse: true,
  keys: true,
  shrink: true,
  padding: {
    left: 1,
    right: 1,
  },
  left: 20,
  top: 2,
  shrink: true,
  name: 'cancel',
  content: 'cancel',
  style: {
    bg: 'blue',
    focus: {
      bg: 'red',
    },
    hover: {
      bg: 'red',
    },
  },
});

submit.on('press', function () {
  form.submit();
});

cancel.on('press', function () {
  form.reset();
});

form.on('submit', function (data) {
  form.setContent('Submitted.');
  screen.render();
});

form.on('reset', function (data) {
  form.setContent('Canceled.');
  screen.render();
});

screen.key('q', function () {
  process.exit(0);
});

screen.render();
