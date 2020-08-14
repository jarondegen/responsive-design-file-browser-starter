class DirectoryTreeNode {
    constructor(name, type, lastModifiedTime) {
        this.name = name;
        this.type = type;
        this.lastModifiedTime = lastModifiedTime;
        this.children = [];
    }

    getIconTypeName() {
        if (this.type === 'directory') {
            return this.name;
        }

        if (this.type === 'file') {
            const dotIndex = this.name.lastIndexOf('.');
            if (dotIndex >= 0) {
                return this.name.substring(dotIndex + 1).toLowerCase();
            }
            return this.name;
        }

        return '';
    }

    addChild(child) {
        this.children.push(child);
    }
}
let root = new DirectoryTreeNode('root', 'directory')

function updateVisualTree(element, directoryTreeNode) {

    // Create an unordered list to make a UI for the directoryTreeNode
    const ul = document.createElement('ul');
    ul.classList.add('tree');
  
    // Create a list element for every child of the directoryTreeNode
    for (let child of directoryTreeNode.children) {
      updateVisualTreeEntry(ul, child);
    }
  
    // Update the tree with the newly created unordered list.
    element.appendChild(ul);
  }
  
  function updateVisualTreeEntry(treeElement, child) {
    const li = document.createElement('li');
      li.classList.add('tree-entry');
  
      // Create a list element with a file icon
      if (child.type === 'file') {
        li.innerHTML = `
          <div class="tree-entry__disclosure tree-entry__disclosure--disabled></div>
          <img class="tree-entry__icon" src="/icons/file_type_${child.getIconTypeName()}.svg">
          <div class="tree-entry__name">${child.name}</div>
          <div class="tree-entry__time">${child.lastModifiedTime}</div>
        `;
  
      // Or create a list element with a folder icon
      } else if (child.type === 'directory') {
        li.innerHTML = `
          <div class="tree-entry__disclosure tree-entry__disclosure--closed"></div>
          <img class="tree-entry__icon" src="/icons/folder_type_${child.getIconTypeName()}.svg">
          <div class="tree-entry__name">${child.name}</div>
          <div class="tree-entry__time">${child.lastModifiedTime}</div>
        `;
      }
  
      // Add the newly created list element into the unordered list
      treeElement.appendChild(li);
  }

window.addEventListener('DOMContentLoaded', event => {

    let filetree = document.querySelector('.filetree');
    fetch('http://localhost:3001/api/path/')
        .then(res => {
            if (!res.ok) throw new Error("Uh oh!")
            return res.json();
        })
        .then(res => {
            res.forEach(el => {
                let node = new DirectoryTreeNode(el.name, el.type, el.lastModifiedTime);
                root.addChild(node)
            })
            document.querySelector('.overlay')
                .classList.add('overlay--hidden')
        })
        .then(res => {
            updateVisualTree(filetree, root)
        })
        .catch(err => {
            overlay.classList.add('overlay--error')
            document.querySelector('.overlay__text')
                .innerHTML = "Uh Oh! Try Again";
            
        })
        
    })

// function updateDom(root,) {
//     let filetree = document.querySelector('.filetree');
//     let left = document.querySelector('.filetree___type');
//     let right = document.querySelector('.filetree__date');
    
//     root.children.forEach(child => {
//         let leftEl = document.createElement('div')
//     })
// }
function updateVisualTree(element, directoryTreeNode) {

  // Create an unordered list to make a UI for the directoryTreeNode
  const ul = document.createElement('ul');
  ul.classList.add('tree');

  // Create a list element for every child of the directoryTreeNode
  for (let child of directoryTreeNode.children) {
    updateVisualTreeEntry(ul, child);
  }

  // Update the tree with the newly created unordered list.
  element.appendChild(ul);
}

function updateVisualTreeEntry(treeElement, child) {
  const li = document.createElement('li');
    li.classList.add('tree-entry');

    // Create a list element with a file icon
    if (child.type === 'file') {
      li.innerHTML = `
        <div class="tree-entry__disclosure tree-entry__disclosure--disabled"></div>
        <img class="tree-entry__icon" src="/icons/file_type_${child.getIconTypeName()}.svg">
        <div class="tree-entry__name">${child.name}</div>
        <div class="tree-entry__time">${child.lastModifiedTime}</div>
      `;

    // Or create a list element with a folder icon
    } else if (child.type === 'directory') {
      li.innerHTML = `
        <div class="tree-entry__disclosure tree-entry__disclosure--closed"></div>
        <img class="tree-entry__icon" src="/icons/folder_type_${child.getIconTypeName()}.svg">
        <div class="tree-entry__name">${child.name}</div>
        <div class="tree-entry__time">${child.lastModifiedTime}</div>
      `;
    }

    // Add the newly created list element into the unordered list
    treeElement.appendChild(li);
}