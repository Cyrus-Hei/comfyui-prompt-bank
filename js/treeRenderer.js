import { createPresetElement } from "./presetUI.js";
import { createPromptElement } from "./promptUI.js";

export class TreeRenderer {
    constructor(treeData) {
        this.treeData = treeData;
        this.alertSuppression = false;
        this.searchTerm = "";
    }

    render(el) {
        this.container = document.createElement('div');
        this.container.style.padding = '10px';
        this.container.id = 'prompt-bank-container';
        el.appendChild(this.container);

        this.createSearchBar(); // Add search bar
        this.createButtons();
        this.createTreeContainer();
        this.renderTree();
    }

    createSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.style.marginBottom = '10px';
        searchContainer.style.display = 'flex';
        
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search presets and prompts...';
        this.searchInput.style.flexGrow = '1';
        this.searchInput.style.padding = '5px';
        this.searchInput.style.borderRadius = '4px 0 0 4px';
        this.searchInput.style.border = '1px solid #444';
        this.searchInput.style.backgroundColor = '#333';
        this.searchInput.style.color = 'white';
        
        const clearButton = document.createElement('button');
        clearButton.textContent = '×';
        clearButton.style.padding = '5px 10px';
        clearButton.style.border = '1px solid #444';
        clearButton.style.borderLeft = 'none';
        clearButton.style.borderRadius = '0 4px 4px 0';
        clearButton.style.backgroundColor = '#333';
        clearButton.style.color = '#aaa';
        clearButton.style.cursor = 'pointer';
        
        // Event listeners
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase().trim();
            this.renderTree();
        });
        
        clearButton.addEventListener('click', () => {
            this.searchInput.value = '';
            this.searchTerm = '';
            this.renderTree();
        });
        
        searchContainer.appendChild(this.searchInput);
        searchContainer.appendChild(clearButton);
        this.container.appendChild(searchContainer);
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

    focusNode(id) {
        this.focusNodeId = id;
        this.searchTerm = '';
        this.searchInput.value = '';
        this.renderTree();
    }

    getAncestors(targetId) {
        const find = (nodes, targetId, path) => {
            for (const node of nodes) {
                const currentPath = [...path, node];
                if (node.id === targetId) {
                    return currentPath;
                }
                if (node.type === 'preset' && node.children) {
                    const found = find(node.children, targetId, currentPath);
                    if (found) return found;
                }
            }
            return null;
        };
        return find(this.treeData.data, targetId, []);
    }

    renderTree() {
        this.treeContainer.innerHTML = '';

        // Focus node logic
        if (this.focusNodeId) {
            const ancestors = this.getAncestors(this.focusNodeId);
            if (ancestors) {
                ancestors.forEach(node => {
                    if (node.type === 'preset') {
                        node.expanded = true;
                    }
                });
            }
        }
        
        // If we have a search term, filter the tree
        if (this.searchTerm) {
            const filteredTree = this.filterTree(this.treeData.data);
            filteredTree.forEach(item => {
                if (item.type === 'preset') {
                    this.renderPreset(item, this.treeContainer, null);
                } else {
                    this.renderPrompt(item, this.treeContainer, null);
                }
            });
            
            // Show message if no results
            if (filteredTree.length === 0) {
                const noResults = document.createElement('div');
                noResults.textContent = 'No matching presets or prompts found';
                noResults.style.padding = '10px';
                noResults.style.textAlign = 'center';
                noResults.style.color = '#888';
                this.treeContainer.appendChild(noResults);
            }
        } else {
            // Show full tree when no search term
            this.treeData.data.forEach(item => {
                if (item.type === 'preset') {
                    this.renderPreset(item, this.treeContainer, null);
                } else {
                    this.renderPrompt(item, this.treeContainer, null);
                }
            });
        }

        // After rendering, scroll to focused node
        if (this.focusNodeId) {
            setTimeout(() => {
                const element = this.treeContainer.querySelector(`[data-id="${this.focusNodeId}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.backgroundColor = '#3a3a6a';
                    setTimeout(() => {
                        element.style.backgroundColor = '#303030';
                    }, 3000);
                }
                this.focusNodeId = null;
            }, 100);
        }
    }

    /**
     * Filters the tree to show only items that match the search term
     * and their parent groups
     */
    filterTree(nodes) {
        const results = [];
        const searchTerm = this.searchTerm;
        
        nodes.forEach(node => {
            // Always include preset groups
            if (node.type === 'preset') {
                // Recursively filter children
                const filteredChildren = this.filterTree(node.children);
                
                // Check if this preset matches search
                const titleMatch = node.title.toLowerCase().includes(searchTerm);
                
                // Include if it has matching children or its title matches
                if (filteredChildren.length > 0 || titleMatch) {
                    // Create a shallow copy with filtered children
                    const newNode = {...node, children: filteredChildren};
                    results.push(newNode);
                }
            } 
            // Check prompt items
            else if (node.type === 'prompt') {
                const titleMatch = node.title.toLowerCase().includes(searchTerm);
                const contentMatch = node.content.toLowerCase().includes(searchTerm);
                
                if (titleMatch || contentMatch) {
                    results.push(node);
                }
            }
        });
        
        return results;
    }

    renderPreset(preset, parentElement, parentData) {
        const isSearchResult = !!this.searchTerm;
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
            },
            isSearchResult,
            onJump: isSearchResult ? () => this.focusNode(preset.id) : null
        });
    }

    renderPrompt(prompt, parentElement, parentData) {
        const isSearchResult = !!this.searchTerm;

        createPromptElement({
            prompt,
            parentElement,
            parentData,
            treeData: this.treeData,
            getAlertSuppression: () => this.alertSuppression, // Pass getter function
            onSave: () => this.treeData.save(),
            isSearchResult,
            onJump: isSearchResult ? () => {
                // Find parent preset for prompt
                const findParent = (nodes, targetId) => {
                    for (const node of nodes) {
                        if (node.type === 'preset' && node.children) {
                            const childMatch = node.children.find(c => c.id === targetId);
                            if (childMatch) return node;
                            const found = findParent(node.children, targetId);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                
                const parent = findParent(this.treeData.data, prompt.id);
                if (parent) {
                    this.focusNode(parent.id);
                }
            } : null
        });
    }
}