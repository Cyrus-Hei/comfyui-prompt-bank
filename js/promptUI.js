export function createPromptElement({ prompt, parentElement, parentData, treeData, getAlertSuppression, onSave, isSearchResult, onJump }) {
    const blockBgColor= '#007958';
    const txtBgColor = '#212121';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'prompt-wrapper';
    wrapper.dataset.id = prompt.id;
    wrapper.style.marginBottom = '0px';
    wrapper.style.border = '1px solid #000';
    wrapper.style.backgroundColor = blockBgColor;
    wrapper.style.opacity = '0.78';
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
        adjustHeight();
        onSave();
    });

    // Exit edit on escape key
    title.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' || ev.key === 'Enter') {
            title.blur();
        }
    });

    // Prompt content
    const content = document.createElement('textarea');
    content.value = prompt.content;
    content.style.width = '100%';
    content.style.minHeight = '20px';
    content.style.maxHeight = '500px';
    content.style.overflowY = 'auto';
    content.readOnly = true;
    content.style.backgroundColor = txtBgColor;
    content.style.cursor = 'pointer';
    content.style.borderColor = 'transparent';

    // Auto-adjust height function
    const adjustHeight = () => {
        content.style.height = 'auto'; // Reset height
        content.style.height = content.scrollHeight + 'px'; // Set to content height
    };

    // Adjust height after element is in DOM
    const resizeObserver = new ResizeObserver(adjustHeight);
    let adjustTimeout;
    
    const scheduleAdjustment = () => {
        clearTimeout(adjustTimeout);
        adjustTimeout = setTimeout(adjustHeight, 10);
    };

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

    // Paste button
    const pasteBtn = document.createElement('button');
    pasteBtn.style.position = 'absolute';
    pasteBtn.style.top = '5px';
    pasteBtn.style.right = '80px';  // Adjusted position
    pasteBtn.className = 'pi pi-clipboard';

    // Color change helper
    const matchColor = () => {
        content.style.backgroundColor = content.readOnly ? txtBgColor : 'black';
    };

    // Event handlers
    content.addEventListener('click', () => {
        if (content.readOnly) {
            navigator.clipboard.writeText(content.value).then(() => {
                content.style.backgroundColor = '#548f64';
                setTimeout(matchColor, 500);
            });
        }
        if (!content.readOnly) {
            adjustHeight();
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
        }, 200);
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
        if (!content.readOnly) {
            content.focus();
            adjustHeight();
        }
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

    // PASTE FUNCTIONALITY
    pasteBtn.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            content.value = clipboardText;
            prompt.content = clipboardText;
            adjustHeight();
            onSave();
            
            // Visual feedback
            content.style.backgroundColor = '#9c9c9c';
            setTimeout(() => {
                if (content.readOnly) {
                    content.style.backgroundColor = txtBgColor;
                } else {
                    content.style.backgroundColor = 'black';
                }
            }, 500);
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            alert('Failed to access clipboard. Make sure you have granted permission.');
        }
    });

    // Jump functionality for search results
    if (onJump) {
        wrapper.addEventListener('click', (e) => {
            // Only trigger if not clicking on interactive elements
            if (!e.target.matches('button') && 
                !e.target.matches('input') && 
                !e.target.matches('textarea')) {
                onJump();
            }
        });
        wrapper.style.cursor = 'pointer';
        wrapper.style.backgroundColor = '#2a2a4a';
    }

    content.addEventListener('input', adjustHeight);

    // Assemble elements
    wrapper.appendChild(title);
    wrapper.appendChild(content);
    wrapper.appendChild(editBtn);
    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(pasteBtn);
    parentElement.appendChild(wrapper);

    // Observe for DOM changes and initial adjustment
    resizeObserver.observe(content);
    scheduleAdjustment();

    // Cleanup on removal
    wrapper.addEventListener('DOMNodeRemoved', () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', scheduleAdjustment);
    });
}