
import { app } from "../../scripts/app.js";

app.registerExtension({ 
	name: "PromptBank.menu",
	async setup(app) { 
        let boo = true;
	},
})

app.extensionManager.registerSidebarTab({
  id: "statefulTab",
  icon: "pi pi-list",
  title: "Notes",
  type: "custom",
  render: (el) => {
    // Create elements
    const container = document.createElement('div');
    container.style.padding = '10px';
    
    const notepad = document.createElement('textarea');
    notepad.style.width = '100%';
    notepad.style.height = '200px';
    notepad.style.marginBottom = '10px';
    
    // Load saved content if available
    const savedContent = localStorage.getItem('comfyui-notes');
    if (savedContent) {
      notepad.value = savedContent;
    }
    
    // Auto-save content
    notepad.addEventListener('input', () => {
      localStorage.setItem('comfyui-notes', notepad.value);
    });
    
    // Assemble the UI
    container.appendChild(notepad);
    el.appendChild(container);
  }
});