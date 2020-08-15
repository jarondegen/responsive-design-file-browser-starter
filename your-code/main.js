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
        child.parent = this;
        this.children.push(child);
    }

    getFullPath() {
      // Special case for the root node with no name
      if (this.name === undefined) {
        return '';
      }
    
      let parentPath = '';
      if (this.parent !== undefined) {
        parentPath = this.parent.getFullPath();
      }
      return `${parentPath}/${this.name}`;
    }
    
    findChild(path) {
        if (path === "") return this;
        let pathArray = path.split("/");
        if (pathArray[0]==="") pathArray.shift();
        let target;
        this.children.forEach(child => {
            if (child.name === pathArray[0]) {
                target = child;
            }
        });
        let newPath = pathArray.slice(1).join("/");
        return target.findChild(newPath);
    }
}
let root = new DirectoryTreeNode()

function updateVisualTree(element, directoryTreeNode) {

    // Create an unordered list to make a UI for the directoryTreeNode
    const ul = document.createElement('ul');
    ul.classList.add('tree');
    if (directoryTreeNode.parent) ul.classList.add('tree--nested')
    
    // if directoryTreeNode has a parent, also add 'tree--nested class'

    // Create a list element for every child of the directoryTreeNode
    for (let child of directoryTreeNode.children) {
      updateVisualTreeEntry(ul, child);
    }
  
    // Update the tree with the newly created unordered list.
    element.appendChild(ul);
  }
  
  function updateVisualTreeEntry(treeElement, child) {
    // make sure to add data attribute with full path
    const li = document.createElement('li');
      li.classList.add('tree-entry');
      li.dataset.pathName = child.getFullPath();
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
            console.log('what')
        })
        .catch(err => {
            overlay.classList.add('overlay--error')
            document.querySelector('.overlay__text')
                .innerHTML = "Uh Oh! Try Again";
            
        })
    
    filetree.addEventListener("click", (e) => {
        if (e.target.classList.contains('tree-entry__disclosure--closed')) {
          e.target.classList.toggle('tree-entry__disclosure--open')
          e.target.classList.toggle('tree-entry__disclosure--closed')
          let parent = e.target.parentElement;
          let path = parent.dataset.pathName;
          let parentNode = root.findChild(path);

          // before the fetch, check if the corresponding treenode has children
          if (parentNode.children.length !== 0) {
            // if it already has children, you don't need to do a fetch
            // just search the html element for 
            // children, and remove the tree--hidden class
            for (node of parent.childNodes) {
              if (!node.classList) continue; 
              node.classList.remove('tree--hidden')
            }
            // then exit the function so that you don't perform an additional fetch
            return;
          }

          fetch(`http://localhost:3001/api/path${path}`)
          .then(res => {
            if (!res.ok) throw new Error();
            console.log(res)
            return res.json();
          }).then(res => {
              res.forEach(el => {
                let node = new DirectoryTreeNode(el.name, el.type, el.lastModifiedTime);
                parentNode.addChild(node);
              });
              updateVisualTree(parent, parentNode);
          });


        }else if (e.target.classList.contains('tree-entry__disclosure--open')) {
          let parent = e.target.parentElement;
          let path = parent.dataset.pathName;
          e.target.classList.toggle('tree-entry__disclosure--open');
          e.target.classList.toggle('tree-entry__disclosure--closed');

          // check all the children, and if they are a tree--nested, add tree--hidden
          for (node of parent.childNodes) {
            if (!node.classList) continue;
            // the previous 'if' statement is necessary because the 'classlist'
            // property doesn't exist, the 'contains' function will cause an error
             if (node.classList.contains('tree--nested')) {
               node.classList.add('tree--hidden')
             }
          }

        }
    });
});

