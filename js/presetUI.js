export function createPresetElement({ preset, parentElement, parentData, childrenContainer, treeData, getAlertSuppression, onSave, onAddChild }) {
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
        title.focus();
        title.select();
    });

    // Exit edit on focus lost
    title.addEventListener('blur', () => {
        title.style.cursor = 'pointer';
        title.readOnly = true;
        preset.title = title.value;
        onSave();
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

    // Event handlers
    addChildPreset.addEventListener('click', () => {
        const newPreset = treeData.addChildPreset(preset);
        onAddChild(newPreset);
        onSave();
    });

    addChildPrompt.addEventListener('click', () => {
        const newPrompt = treeData.addChildPrompt(preset);
        onAddChild(newPrompt);
        onSave();
    });

    // Delete preset
    deleteBtn.addEventListener('click', () => {
        // Use getter function to get current value
        const alertSuppression = getAlertSuppression();
        const doDelete = alertSuppression || confirm('Delete this preset and all its contents?');
        if (doDelete) {
            if (treeData.removeItem(parentData, preset)) {
                parentElement.removeChild(presetElement);
                onSave();
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
        onAddChild(child);
    });
}