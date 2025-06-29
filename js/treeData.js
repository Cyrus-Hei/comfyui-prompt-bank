export class TreeData {
    constructor() {
        this.data = [];
    }

    load() {
        const savedData = localStorage.getItem('comfyui-prompt-bank');
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
            } catch (e) {
                console.error('Error loading prompt bank data:', e);
                this.data = [];
            }
        }
    }

    save() {
        const cleanData = JSON.parse(JSON.stringify(this.data, (key, value) => {
            return key === 'parent' ? undefined : value;
        }));
        localStorage.setItem('comfyui-prompt-bank', JSON.stringify(cleanData));
    }

    addRootPreset() {
        const newPreset = {
            id: Date.now().toString(),
            type: 'preset',
            title: 'New Preset',
            children: []
        };
        this.data.push(newPreset);
        return newPreset;
    }

    addRootPrompt() {
        const newPrompt = {
            id: Date.now().toString(),
            type: 'prompt',
            title: 'New Prompt',
            content: ''
        };
        this.data.push(newPrompt);
        return newPrompt;
    }

    addChildPreset(parent) {
        const newPreset = {
            id: Date.now().toString(),
            type: 'preset',
            title: 'New Preset',
            children: []
        };
        parent.children.push(newPreset);
        return newPreset;
    }

    addChildPrompt(parent) {
        const newPrompt = {
            id: Date.now().toString(),
            type: 'prompt',
            title: 'New Prompt',
            content: ''
        };
        parent.children.push(newPrompt);
        return newPrompt;
    }

    removeItem(parent, item) {
        const arr = parent ? parent.children : this.data;
        const index = arr.findIndex(i => i.id === item.id);
        if (index !== -1) {
            arr.splice(index, 1);
            return true;
        }
        return false;
    }
}