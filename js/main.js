import { app } from "../../scripts/app.js";
import { TreeData } from "./treeData.js";
import { TreeRenderer } from "./treeRenderer.js";

app.registerExtension({
    name: "PromptBank.menu",
    async setup(app) {
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