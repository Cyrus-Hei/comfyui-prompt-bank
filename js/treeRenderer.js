import { createPresetElement } from "./presetUI.js";
import { createPromptElement } from "./promptUI.js";

export class TreeRenderer {
    constructor(treeData) {
        this.treeData = treeData;
        this.alertSuppression = false;
    }

    render(el) {
        this.container = document.createElement('div');
        this.container.style.padding = '10px';
        this.container.id = 'prompt-bank-container';
        el.appendChild(this.container);

        this.createButtons();
        this.createTreeContainer();
        this.renderTree();
    }

    createButtons() {
        // Add Preset button
        this.addPreset = document.createElement('button');
        this.addPreset.textContent = '+ Preset';
        this.addPreset.style.marginBottom = '10px';
        this.addPreset.addEventListener('click', () => {
            const newPreset = this.treeData.addRootPreset();
            this.renderPreset(newPreset, this.treeContainer, null);
            this.treeData.save();
        });
        this.container.appendChild(this.addPreset);

        // Add Prompt button
        this.addPrompt = document.createElement('button');
        this.addPrompt.textContent = '+ Prompt';
        this.addPrompt.style.marginBottom = '10px';
        this.addPrompt.style.marginLeft = '10px';
        this.addPrompt.addEventListener('click', () => {
            const newPrompt = this.treeData.addRootPrompt();
            this.renderPrompt(newPrompt, this.treeContainer, null);
            this.treeData.save();
        });
        this.container.appendChild(this.addPrompt);

        // Alert suppression toggle button
        this.noAlert = document.createElement('button');
        this.noAlert.style.float = 'right';
        this.noAlert.textContent = 'Delete Alert On';
        this.noAlert.style.marginBottom = '10px';
        this.noAlert.style.right = '10px';
        this.noAlert.style.borderColor = 'transparent';
        this.noAlert.style.backgroundColor = this.alertSuppression ? '#d63820' : '#548f64';
        this.noAlert.addEventListener('click', () => {
            this.alertSuppression = !this.alertSuppression;
            this.noAlert.style.backgroundColor = this.alertSuppression ? '#d63820' : '#548f64';
            this.noAlert.textContent = this.alertSuppression ? 'Delete Alert Off' : 'Delete Alert On';
        });
        this.container.appendChild(this.noAlert);
    }

    createTreeContainer() {
        this.treeContainer = document.createElement('div');
        this.treeContainer.id = 'prompt-bank-tree';
        this.container.appendChild(this.treeContainer);
    }

    renderTree() {
        this.treeContainer.innerHTML = '';
        this.treeData.data.forEach(item => {
            if (item.type === 'preset') {
                this.renderPreset(item, this.treeContainer, null);
            } else {
                this.renderPrompt(item, this.treeContainer, null);
            }
        });
    }

    renderPreset(preset, parentElement, parentData) {
        // Create children container
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'preset-children';
        childrenContainer.style.marginTop = '10px';
        
        createPresetElement({
            preset,
            parentElement,
            parentData,
            childrenContainer,
            treeData: this.treeData,
            getAlertSuppression: () => this.alertSuppression, // Pass getter function
            onSave: () => this.treeData.save(),
            onAddChild: (child) => {
                if (child.type === 'preset') {
                    this.renderPreset(child, childrenContainer, preset);
                } else {
                    this.renderPrompt(child, childrenContainer, preset);
                }
            }
        });
    }

    renderPrompt(prompt, parentElement, parentData) {
        createPromptElement({
            prompt,
            parentElement,
            parentData,
            treeData: this.treeData,
            getAlertSuppression: () => this.alertSuppression, // Pass getter function
            onSave: () => this.treeData.save()
        });
    }
}