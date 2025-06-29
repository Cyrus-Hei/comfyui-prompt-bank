
import { app } from "../../scripts/app.js";

app.registerExtension({ 
	name: "PromptBank.menu",
	async setup(app) { 
        let boo = true;
	},
})

// todo:
// figure out storage structure, figure out how to save and load /
//    presets (group of prompts) => wrapper
//    prompts => textarea
// thumbnail for preset or prompt?
// copy whole preset?
// selective copy with checkbox?


app.extensionManager.registerSidebarTab({
  id: "PromptMenu",
  icon: "pi pi-pencil",
  title: "Prompt Bank",
  tooltip: "Prompt Bank",
  type: "custom",
  render: (el) => {
    // Create container
    const container = document.createElement('div');
    container.style.padding = '10px';
    container.id = 'prompt-bank-container';

    // Create "Add Preset" button
    const addPreset = document.createElement('button');
    addPreset.textContent = '+ Preset';
    addPreset.style.marginBottom = '10px';
    container.appendChild(addPreset);

    // Create "Add Prompt" button
    const addPrompt = document.createElement('button');
    addPrompt.textContent = '+ Prompt';
    addPrompt.style.marginBottom = '10px';
    addPrompt.style.marginLeft = '10px';
    container.appendChild(addPrompt);

    // Create "Add Prompt" button
    let alertSuppression = false;
    const noAlert = document.createElement('button');
    noAlert.style.float = 'right';
    noAlert.textContent = 'Delete Alert On';
    noAlert.style.marginBottom = '10px';
    noAlert.style.right = '10px';
    noAlert.style.borderColor = 'transparent';
    noAlert.style.backgroundColor = alertSuppression ? '#d63820' : '#548f64';
    container.appendChild(noAlert);

    // Create wrapper for tree structure
    const treeContainer = document.createElement('div');
    treeContainer.id = 'prompt-bank-tree';
    container.appendChild(treeContainer);

    // Initialize data structure
    let treeData = [];

    // Load saved data
    const loadTreeData = () => {
      const savedData = localStorage.getItem('comfyui-prompt-bank');
      if (savedData) {
        try {
          treeData = JSON.parse(savedData);
        } catch (e) {
          console.error('Error loading prompt bank data:', e);
          treeData = [];
        }
      }
    };

    // Save data to localStorage (without parent references)
    const saveTreeData = () => {
      // Create a clean copy without parent references
      const cleanData = JSON.parse(JSON.stringify(treeData, (key, value) => {
        return key === 'parent' ? undefined : value;
      }));
      localStorage.setItem('comfyui-prompt-bank', JSON.stringify(cleanData));
    };

    // Function to create preset UI element
    const createPresetElement = (preset, parentElement, parentData) => {
      const presetElement = document.createElement('div');
      presetElement.className = 'preset-wrapper';
      presetElement.dataset.id = preset.id;
      presetElement.style.marginBottom = '0px';
      presetElement.style.border = '1px solid #ccc';
      presetElement.style.padding = '10px';
      presetElement.style.paddingTop = '35px';
      presetElement.style.paddingRight = '0px';
      presetElement.style.paddingBottom = '0px';
      presetElement.style.borderRadius = '5px';
      presetElement.style.position = 'relative';

      // Preset title
      const title = document.createElement('input');
      title.value = preset.title;
      title.style.position = 'absolute';
      title.style.top = '5px';
      title.style.left = '10px';
      title.style.width = '60%';
      title.style.height = '25px';
      title.style.backgroundColor = 'transparent';
      title.style.borderColor = 'transparent';
      title.style.color = 'white';
      title.style.cursor = 'pointer';
      title.readOnly = true;
      
      // Edit on double click
      title.addEventListener('dblclick', () => {
        title.style.cursor = 'text';
        title.readOnly = false;
      })

      // Exit edit on focus lost
      title.addEventListener('blur', () => {
        title.style.cursor = 'pointer';
        title.readOnly = true;
        preset.title = title.value;
        saveTreeData();
      });

      // Exit edit on escape key
      title.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
          title.blur();
        }
      });

      // Add child preset button
      const addChildPreset = document.createElement('button');
      addChildPreset.textContent = '+ Preset';
      addChildPreset.style.position = 'absolute';
      addChildPreset.style.top = '5px';
      addChildPreset.style.right = '115px';
      addChildPreset.style.fontSize = '0.8em';

      // Add child prompt button
      const addChildPrompt = document.createElement('button');
      addChildPrompt.textContent = '+ Prompt';
      addChildPrompt.style.position = 'absolute';
      addChildPrompt.style.top = '5px';
      addChildPrompt.style.right = '45px';
      addChildPrompt.style.fontSize = '0.8em';

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.style.position = 'absolute';
      deleteBtn.style.top = '5px';
      deleteBtn.style.right = '10px';
      deleteBtn.className = 'pi pi-trash';
      deleteBtn.style.color = '#d63820';

      // Children container
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'preset-children';
      childrenContainer.style.marginTop = '10px';

      // Event handlers
      addChildPreset.addEventListener('click', () => {
        const newPreset = {
          id: Date.now().toString(),
          type: 'preset',
          title: 'New Preset',
          children: []
        };
        preset.children.push(newPreset);
        createPresetElement(newPreset, childrenContainer, preset);
        saveTreeData();
      });

      // add child prompt
      addChildPrompt.addEventListener('click', () => {
        const newPrompt = {
          id: Date.now().toString(),
          type: 'prompt',
          title: 'New Prompt',
          content: ''
        };
        preset.children.push(newPrompt);
        createPromptElement(newPrompt, childrenContainer, preset);
        saveTreeData();
      });

      // Delete preset
      deleteBtn.addEventListener('click', () => {
        const doDelete = alertSuppression || confirm('Delete this preset and all its contents?');
        if (doDelete) {
          const parentArray = parentData ? parentData.children : treeData;
          const index = parentArray.findIndex(p => p.id === preset.id);
          if (index !== -1) {
            parentArray.splice(index, 1);
            parentElement.removeChild(presetElement);
            saveTreeData();
          }
        }
      });

      // Assemble elements
      presetElement.appendChild(title);
      presetElement.appendChild(addChildPreset);
      presetElement.appendChild(addChildPrompt);
      presetElement.appendChild(deleteBtn);
      presetElement.appendChild(childrenContainer);
      parentElement.appendChild(presetElement);

      // Render children
      preset.children.forEach(child => {
        if (child.type === 'preset') {
          createPresetElement(child, childrenContainer, preset);
        } else {
          createPromptElement(child, childrenContainer, preset);
        }
      });
    };

    // Function to create prompt UI element
    const createPromptElement = (prompt, parentElement, parentData) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'prompt-wrapper';
      wrapper.dataset.id = prompt.id;
      wrapper.style.marginBottom = '0px';
      wrapper.style.border = '1px solid #ccc';
      wrapper.style.padding = '10px';
      wrapper.style.paddingTop = '35px';
      wrapper.style.borderRadius = '5px';
      wrapper.style.position = 'relative';

      // Prompt title
      const title = document.createElement('input');
      title.value = prompt.title;
      title.style.position = 'absolute';
      title.style.top = '5px';
      title.style.left = '10px';
      title.style.width = '60%';
      title.style.height = '25px';
      title.style.backgroundColor = 'transparent';
      title.style.borderColor = 'transparent';
      title.style.color = 'white';
      title.style.cursor = 'text';
      title.contentEditable = true;
      
      // Edit on double click
      title.addEventListener('dblclick', () => {
        title.style.cursor = 'text';
        title.readOnly = false;
      })

      // Exit edit on focus lost
      title.addEventListener('blur', () => {
        title.style.cursor = 'pointer';
        title.readOnly = true;
        preset.title = title.value;
        saveTreeData();
      });

      // Exit edit on escape key
      title.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
          title.blur();
        }
      });

      // Prompt content
      const content = document.createElement('textarea');
      content.value = prompt.content;
      content.style.width = '100%';
      content.style.height = '100px';
      content.readOnly = true;
      content.style.backgroundColor = '#808080';
      content.style.cursor = 'pointer';
      
      // Edit button
      const editBtn = document.createElement('button');
      editBtn.style.position = 'absolute';
      editBtn.style.top = '5px';
      editBtn.style.right = '45px';
      editBtn.className = 'pi pi-pencil';

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.style.position = 'absolute';
      deleteBtn.style.top = '5px';
      deleteBtn.style.right = '10px';
      deleteBtn.className = 'pi pi-trash';
      deleteBtn.style.color = '#d63820';

      // Color change helper
      const matchColor = () => {
        content.style.backgroundColor = content.readOnly ? '#808080' : 'black';
      };

      // Event handlers
      content.addEventListener('click', () => {
        if (content.readOnly) {
          navigator.clipboard.writeText(content.value).then(() => {
            content.style.backgroundColor = '#548f64';
            setTimeout(matchColor, 500);
          });
        }
      });

      // Edit mode on double click
      content.addEventListener('dblclick', () => {
        content.readOnly = !content.readOnly;
        matchColor();
        content.style.cursor = content.readOnly ? 'pointer' : 'text';
        editBtn.className = content.readOnly ? 'pi pi-pencil' : 'pi pi-save';
        if (!content.readOnly) content.focus();
      });

      // Exit edit mode and save on blur (prompt)
      content.addEventListener('blur', () => {
        setTimeout(function() {
          if (!content.readOnly) {
            content.readOnly = true;
            matchColor();
            content.style.cursor = 'pointer';
            editBtn.className = 'pi pi-pencil';
            prompt.content = content.value;
          saveTreeData();
        }}, 100);
      });

      // Exit edit mode on escape key
      content.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
          content.blur();
        }
      });

      // Edit mode toggle on edit button click
      editBtn.addEventListener('click', () => {
        console.log(content.readOnly);
        content.readOnly = !content.readOnly;
        matchColor();
        console.log(content.readOnly);
        content.style.cursor = content.readOnly ? 'pointer' : 'text';
        editBtn.className = content.readOnly ? 'pi pi-pencil' : 'pi pi-save';
        if (!content.readOnly) content.focus();
        if (content.readOnly) {
          prompt.content = content.value;
          saveTreeData();
        }
      });

      // Delete prompt 
      deleteBtn.addEventListener('click', () => {
        const doDelete = alertSuppression || confirm('Delete this prompt?');
        if (doDelete) {
          const parentArray = parentData ? parentData.children : treeData;
          const index = parentArray.findIndex(p => p.id === prompt.id);
          if (index !== -1) {
            parentArray.splice(index, 1);
            parentElement.removeChild(wrapper);
            saveTreeData();
          }
        }
      });

      // Assemble elements
      wrapper.appendChild(title);
      wrapper.appendChild(content);
      wrapper.appendChild(editBtn);
      wrapper.appendChild(deleteBtn);
      parentElement.appendChild(wrapper);
    };

    // Initialize tree
    const renderTree = () => {
      treeContainer.innerHTML = '';
      treeData.forEach(item => {
        if (item.type === 'preset') {
          createPresetElement(item, treeContainer, null);
        } else {
          createPromptElement(item, treeContainer, null);
        }
      });
    };

    // Add root preset
    addPreset.addEventListener('click', () => {
      const newPreset = {
        id: Date.now().toString(),
        type: 'preset',
        title: 'New Preset',
        children: []
      };
      treeData.push(newPreset);
      createPresetElement(newPreset, treeContainer, null);
      saveTreeData();
    });

    // Add root prompt
    addPrompt.addEventListener('click', () => {
      const newPrompt = {
        id: Date.now().toString(),
        type: 'prompt',
        title: 'New Prompt',
        content: ''
      };
      treeData.push(newPrompt);
      createPromptElement(newPrompt, treeContainer, null);
      saveTreeData();
    });

    // Toggle deletion alert
    noAlert.addEventListener('click', () => {
      alertSuppression = !alertSuppression;
      noAlert.style.backgroundColor = alertSuppression ? '#d63820' : '#548f64';
      noAlert.textContent = alertSuppression ? 'Delete Alert Off' : 'Delete Alert On';
    })

    // Load and render
    loadTreeData();
    renderTree();

    el.appendChild(container);
  }
});