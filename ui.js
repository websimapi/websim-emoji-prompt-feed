const feedContainer = document.getElementById('feed-container');
const loadingIndicator = document.getElementById('loading');

export function createFeedItemElement(user, project, parentContainer = feedContainer) {
    const itemContent = document.createElement('div');
    itemContent.className = 'feed-item-content';

    let containerElement;

    // The whole item is a link if it's a project
    if (project) {
        const linkWrapper = document.createElement('a');
        linkWrapper.href = `https://websim.com/p/${project.id}`;
        linkWrapper.target = '_blank';
        linkWrapper.className = 'feed-item';
        linkWrapper.appendChild(itemContent);
        containerElement = linkWrapper;
    } else {
        containerElement = document.createElement('div');
        containerElement.className = 'feed-item';
        containerElement.appendChild(itemContent);
    }

    const emojiDisplay = document.createElement('div');
    emojiDisplay.className = 'emoji-display';
    emojiDisplay.textContent = '...';

    const promptText = document.createElement('div');
    promptText.className = 'prompt-text';
    promptText.textContent = 'Generating...';
    
    const individualPromptsContainer = document.createElement('div');
    individualPromptsContainer.className = 'individual-prompts-container hidden';

    itemContent.appendChild(emojiDisplay);
    itemContent.appendChild(promptText);
    itemContent.appendChild(individualPromptsContainer);

    if (user) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        
        const userProfileLink = document.createElement('a');
        userProfileLink.href = `https://websim.com/@${user.username}`;
        userProfileLink.target = '_blank';
        userProfileLink.className = 'user-profile-link';
        userProfileLink.addEventListener('click', e => e.stopPropagation());

        const userAvatar = document.createElement('img');
        userAvatar.src = user.avatar_url || `https://images.websim.com/avatar/${user.username}`;
        const userName = document.createElement('span');
        userName.textContent = `@${user.username}`;
        
        userProfileLink.appendChild(userAvatar);
        userProfileLink.appendChild(userName);
        userInfo.appendChild(userProfileLink);
        itemContent.appendChild(userInfo);
    }
    
    const controls = document.createElement('div');
    controls.className = 'item-controls';
    itemContent.appendChild(controls);

    parentContainer.appendChild(containerElement);
    return itemContent;
}

export function updateFeedItem(item, itemData) {
    item.dataset.itemData = JSON.stringify(itemData);
    
    const emojiDisplay = item.querySelector('.emoji-display');
    const promptText = item.querySelector('.prompt-text');
    const individualPromptsContainer = item.querySelector('.individual-prompts-container');
    const controlsContainer = item.querySelector('.item-controls');
    
    // Clear previous content
    individualPromptsContainer.innerHTML = '';
    controlsContainer.innerHTML = '';
    promptText.textContent = '';
    
    // Set summary emoji
    emojiDisplay.textContent = itemData.summaryEmoji;
    
    // Show a summary or single prompt text
    if (itemData.type === 'project') {
        promptText.textContent = itemData.project.title || 'Project Summary';
    } else {
        promptText.textContent = itemData.prompts[0].text;
    }
    
    // Handle multiple prompts for projects
    if (itemData.prompts.length > 1) {
        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.textContent = 'View Prompts';
        viewDetailsButton.className = 'control-button';
        
        viewDetailsButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            individualPromptsContainer.classList.toggle('hidden');
            const isHidden = individualPromptsContainer.classList.contains('hidden');
            viewDetailsButton.textContent = isHidden ? 'View Prompts' : 'Hide Prompts';
            item.classList.toggle('details-visible', !isHidden);
        });
        
        controlsContainer.appendChild(viewDetailsButton);
        
        // Populate individual prompts list
        itemData.prompts.forEach(p => {
            const promptEntry = document.createElement('div');
            promptEntry.className = 'individual-prompt';
            promptEntry.innerHTML = `<span class="emoji">${p.emoji}</span><span class="text">${p.text}</span>`;
            individualPromptsContainer.appendChild(promptEntry);
        });
    }
}

export function showLoading(message) {
    const p = loadingIndicator.querySelector('p');
    if (p) p.textContent = message;
    loadingIndicator.classList.remove('hidden');
}

export function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

export function showFinalError(message) {
    const p = loadingIndicator.querySelector('p');
    const spinner = loadingIndicator.querySelector('.spinner');
    if (p) p.textContent = message;
    if (spinner) spinner.style.display = 'none';
    loadingIndicator.classList.remove('hidden');
}