
import { app } from "../../scripts/app.js";

app.registerExtension({ 
	name: "PromptBank.menu",
	async setup(app) { 
        let boo = true;
	},
})

// app.extensionManager.registerSidebarTab({
//   id: "PromptMenu",
//   icon: "pi pi-pencil",
//   title: "Prompt Bank",
//   tooltip: "Prompt Bank",
//   type: "custom",
//   render: (el) => {
//     // Create elements
//     const container = document.createElement('div');
//     container.style.padding = '10px';
    
//     const notepad = document.createElement('textarea');
//     notepad.style.width = '100%';
//     notepad.style.height = '200px';
//     notepad.style.marginBottom = '10px';
    
//     // Load saved content if available
//     const savedContent = localStorage.getItem('comfyui-notes');
//     if (savedContent) {
//       notepad.value = savedContent;
//     }
    
//     // Auto-save content
//     notepad.addEventListener('input', () => {
//       localStorage.setItem('comfyui-notes', notepad.value);
//     });
    
//     // Assemble the UI
//     container.appendChild(notepad);
//     el.appendChild(container);
//   }
// });

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

    // Create "Add Preset" button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Preset';
    addButton.style.marginBottom = '10px';
    container.appendChild(addButton);

    // Function to create a new prompt box
    let noteCount = 0;
    const createPrompt = (promptValue = '', titleValue = '') => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '15px';
      wrapper.style.border = '1px solid #ccc';
      wrapper.style.padding = '10px';
      wrapper.style.paddingTop = '35px';
      wrapper.style.borderRadius = '5px';
      wrapper.style.position = 'relative';

      const prompt = document.createElement('textarea');
      prompt.style.width = '100%';
      prompt.style.height = '100px';
      prompt.readOnly = true;
      prompt.value = promptValue;
      prompt.style.backgroundColor = '#808080';
      prompt.style.cursor = 'pointer';
      
      const title = document.createElement('input');
      title.style.position = 'absolute';
      title.style.top = '5px';
      title.style.left = '10px';
      title.style.width = '100px';
      title.style.height = '25px';
      title.readOnly = true;
      title.value = titleValue;
      // title.style.backgroundColor = '#808080';
      prompt.style.cursor = 'text';
      title.readOnly = false;
      title.contentEditable = true;


      //Create edit button
      const editBtn = document.createElement('button');
      editBtn.style.position = 'absolute';
      editBtn.style.top = '5px';
      editBtn.style.right = '45px';
      editBtn.className = 'pi pi-pencil';

      // Create delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.style.position = 'absolute';
      deleteBtn.style.top = '5px';
      deleteBtn.style.right = '10px';
      deleteBtn.className = 'pi pi-trash';
      deleteBtn.style.color = '#d63820';

      const matchColor = () => {
        prompt.style.backgroundColor = prompt.readOnly ? '#808080' : 'black';
      }

      // Click-to-copy when read-only
      prompt.addEventListener('click', () => {
        if (prompt.readOnly) {
          navigator.clipboard.writeText(prompt.value).then(() => {
            prompt.style.backgroundColor = '#548f64';
            setTimeout(matchColor, 500)
          });
        }
      });

      const editPrompt = () => {
        prompt.readOnly = !prompt.readOnly;
        prompt.style.backgroundColor = prompt.readOnly ? '#808080' : 'black';
        prompt.style.cursor = prompt.readOnly ? 'pointer' : 'text';
        editBtn.className = prompt.readOnly ? 'pi pi-pencil': 'pi pi-save';
      }

      prompt.addEventListener('dblclick', () => {
        editPrompt();
      });

      prompt.addEventListener('blur', () => {
        if (prompt.readOnly == false) {
          prompt.readOnly = true
          prompt.style.backgroundColor = '#808080';
          prompt.style.cursor = 'pointer';
          editBtn.className = 'pi pi-pencil';
          saveAllPrompts(); // Save on exit edit
        }
      });

      // Toggle edit mode
      editBtn.addEventListener('click', () => {
        editPrompt();

        if (prompt.readOnly) {
          saveAllPrompts(); // Save on exit edit
        }
      });

      // Delete prompt
      deleteBtn.addEventListener('click', () => {
        container.removeChild(wrapper);
        saveAllPrompts();
      });

      wrapper.appendChild(title);
      wrapper.appendChild(prompt);
      wrapper.appendChild(editBtn);
      wrapper.appendChild(deleteBtn);
      container.appendChild(wrapper);
    };

    // Save all prompts to localStorage
    const saveAllPrompts = () => {
      const allTextareas = container.querySelectorAll('textarea');
      const contents = Array.from(allTextareas).map(t => t.value);
      localStorage.setItem('comfyui-notes', JSON.stringify(contents));
    };

    // Add new preset on button click
    addButton.addEventListener('click', () => {
      createPrompt('', 'test');
      saveAllPrompts();
    });

    // Load saved prompts
    const savedNotes = JSON.parse(localStorage.getItem('comfyui-notes') || '[]');
    savedNotes.forEach(note => createPrompt(note, 'test'));

    el.appendChild(container);
  }
});
