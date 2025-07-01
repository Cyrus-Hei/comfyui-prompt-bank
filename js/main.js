import { app } from "../../scripts/app.js";
import { TreeData } from "./treeData.js";
import { TreeRenderer } from "./treeRenderer.js";

const EXTENSION_CSS = `
button:hover {
    opacity:0.8;
}

.pi.pi-clipboard {
}
`

app.registerExtension({
    name: "PromptBank.menu",
    async setup(app) {
        // Inject CSS into the shadow DOM
        const style = document.createElement('style');
        style.textContent = EXTENSION_CSS;
        document.head.appendChild(style);

        // Initialize data management
        const treeData = new TreeData();
        treeData.load();
        
        app.extensionManager.registerSidebarTab({
            id: "PromptMenu",
            icon: "pi pi-pencil",
            title: "Prompt Bank",
            tooltip: "Prompt Bank",
            type: "custom",
            render: (el) => {
                // Initialize tree renderer
                const renderer = new TreeRenderer(treeData);
                renderer.render(el);
            }
        });
    }
});