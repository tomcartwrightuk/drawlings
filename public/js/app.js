const consoleContainer = document.getElementById('console-container');
window.console = {
  log: (d) => {
    const li = document.createElement('LI')
    const text = document.createTextNode('>    '+d)
    li.appendChild(text)
    consoleContainer.appendChild(li)
  },
  error: (d) => {
    const li = document.createElement('LI')
    const text = document.createTextNode('>    '+d)
    li.appendChild(text)
    consoleContainer.appendChild(li)
  },
}

console.log(consoleContainer);
console.error(new Error('Thing went wrong'));
