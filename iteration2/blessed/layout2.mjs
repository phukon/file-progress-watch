import blessed from 'blessed';


// Create a screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal Interface',
});

// Create a box for the menu
const menuBox = blessed.box({
  parent: screen,
  top: '0',
  left: '0',
  width: '20%',
  height: '100%',
  border: {
    type: 'line',
  },
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: 'white',
    },
  },
});

// Create a menu
const menu = blessed.list({
  parent: menuBox,
  top: 'center',
  left: 'center',
  width: '90%',
  height: '90%',
  align: 'center',
  tags: true,
  border: {
    type: 'line',
  },
  style: {
    selected: {
      bg: 'yellow',
      bold: true,
    },
  },
  items: ['Option 1', 'Option 2', 'Option 3', 'Quit'],
});

// Create a box for the log area
const logBox = blessed.box({
  parent: screen,
  top: '0',
  left: '20%',
  width: '80%',
  height: '100%',
  border: {
    type: 'line',
  },
  scrollbar: {
    ch: ' ',
    inverse: true,
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'white',
    },
  },
});

// Create a log function
function logMessage(message) {
  logBox.pushLine(message);
  screen.render();
}

// Event handling for menu selection
menu.on('select', (item) => {
  if (item.content === 'Quit') {
    return process.exit(0);
  }
  logMessage(`Selected: ${item.content}`);
});

// Handle Escape or Q to quit
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});

// Initial log message
logMessage('Welcome! Use arrow keys to navigate the menu.');

// Focus on the menu to enable keyboard navigation
menu.focus();

// Render the screen
screen.render();
