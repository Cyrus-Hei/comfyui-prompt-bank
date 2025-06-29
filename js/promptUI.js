export function createPromptElement({ prompt, parentElement, parentData, treeData, getAlertSuppression, onSave }) {
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
        title.focus();
        title.select();
    });

    // Exit edit on focus lost
    title.addEventListener('blur', () => {
        title.style.cursor = 'pointer';
        title.readOnly = true;
        prompt.title = title.value;
        onSave();
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
        if (!content.readOnly) {
            content.focus();
            content.select();
        }
    });

    // Exit edit mode and save on blur (prompt)
    content.addEventListener('blur', () => {
        setTimeout(() => {
            if (!content.readOnly) {
                content.readOnly = true;
                matchColor();
                content.style.cursor = 'pointer';
                editBtn.className = 'pi pi-pencil';
                prompt.content = content.value;
                onSave();
            }
        }, 100);
    });

    // Exit edit mode on escape key
    content.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
            content.blur();
        }
    });

    // Edit mode toggle on edit button click
    editBtn.addEventListener('click', () => {
        content.readOnly = !content.readOnly;
        matchColor();
        content.style.cursor = content.readOnly ? 'pointer' : 'text';
        editBtn.className = content.readOnly ? 'pi pi-pencil' : 'pi pi-save';
        if (!content.readOnly) content.focus();
        if (content.readOnly) {
            prompt.content = content.value;
            onSave();
        }
    });

    // Delete prompt 
    deleteBtn.addEventListener('click', () => {
        // Use getter function to get current value
        const alertSuppression = getAlertSuppression();
        const doDelete = alertSuppression || confirm('Delete this prompt?');
        if (doDelete) {
            if (treeData.removeItem(parentData, prompt)) {
                parentElement.removeChild(wrapper);
                onSave();
            }
        }
    });

    // Assemble elements
    wrapper.appendChild(title);
    wrapper.appendChild(content);
    wrapper.appendChild(editBtn);
    wrapper.appendChild(deleteBtn);
    parentElement.appendChild(wrapper);
}