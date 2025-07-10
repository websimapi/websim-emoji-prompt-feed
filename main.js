import { fetchNewPrompts, fetchFollowingProjects, convertToEmojiPrompt, getProjectPrompts, summarizeAndConvertToEmoji, fetchTrendingProjects } from './api.js';
import { createFeedItemElement, updateFeedItem, hideLoading, showLoading, showFinalError, initializeModal, showEndOfFollowedProjectsMessage } from './ui.js';

const feedContainer = document.getElementById('feed-container');
const likedFeedContainer = document.getElementById('liked-feed-container');
const likeButton = document.getElementById('like-button');

const MIN_AHEAD_BUFFER = 7;
const BATCH_SIZE = 5; // Reduced batch size due to more intensive processing per item

let isFetching = false;
let itemsQueue = [];
let user = null;
let followingCursor = null; 
let hasMoreFollowedProjects = true; 
let trendingOffset = 0;
let hasMoreTrendingProjects = true;
let processedProjectIds = new Set();
let endOfFollowedMessageShown = false;

let likedItems = [];
const LIKED_ITEMS_KEY = 'infinite_emoji_feed_liked_items';
let isLikedFeedActive = false;
let mainFeedScrollPosition = 0;
let currentItemElement = null;

let pageHtmlContent = ''; // Store page HTML for AI context

// --- LocalStorage and Like Management ---

function loadLikedItems() {
    const storedLikes = localStorage.getItem(LIKED_ITEMS_KEY);
    if (storedLikes) {
        try {
            likedItems = JSON.parse(storedLikes);
        } catch (e) {
            console.error("Could not parse liked items:", e);
            likedItems = [];
        }
    }
}

function saveLikedItems() {
    localStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(likedItems));
}

function isItemLiked(itemData) {
    if (!itemData || !itemData.id) return false;
    return likedItems.some(liked => liked.id === itemData.id);
}

function likeCurrentItem() {
    if (!currentItemElement || !currentItemElement.dataset.itemData) return;

    const itemData = JSON.parse(currentItemElement.dataset.itemData);

    if (isItemLiked(itemData)) {
        likedItems = likedItems.filter(liked => liked.id !== itemData.id);
        likeButton.classList.remove('liked');
        console.log('Unliked:', itemData.id);

        if (isLikedFeedActive) {
            const elementToRemove = currentItemElement.parentElement;
            const container = elementToRemove.parentElement;
            
            elementToRemove.remove();

            if (container.children.length === 0) {
                renderLikedFeed(); 
            } else {
                setTimeout(updateLikeButtonState, 100);
            }
        }

    } else {
        likedItems.push(itemData);
        likeButton.classList.add('liked');
        console.log('Liked:', itemData.id);
    }
    saveLikedItems();
}

function updateLikeButtonState() {
    const container = isLikedFeedActive ? likedFeedContainer : feedContainer;
    if (container.children.length === 0) {
        likeButton.classList.remove('liked');
        currentItemElement = null;
        return;
    };
    const currentItemIndex = Math.round(container.scrollTop / window.innerHeight);
    const feedItemWrapper = container.children[currentItemIndex];
    currentItemElement = feedItemWrapper?.querySelector('.feed-item-content');

    if (currentItemElement && currentItemElement.dataset.itemData) {
        const itemData = JSON.parse(currentItemElement.dataset.itemData);
        if (isItemLiked(itemData)) {
            likeButton.classList.add('liked');
        } else {
            likeButton.classList.remove('liked');
        }
    } else {
        likeButton.classList.remove('liked');
    }
}

// --- Feed Toggling ---

function renderLikedFeed() {
    likedFeedContainer.innerHTML = '';
    if (likedItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'feed-item';
        emptyMessage.innerHTML = `<div class="feed-item-content" style="justify-content:center; text-align: center;"><div class="prompt-text">You haven't liked anything yet.<br><br><small>(Right-click the heart button to go back)</small></div></div>`;
        likedFeedContainer.appendChild(emptyMessage);
    } else {
        likedItems.slice().reverse().forEach(itemData => {
            const author = itemData.user;
            const project = itemData.project;
            const itemElement = createFeedItemElement(author, project, likedFeedContainer);
            updateFeedItem(itemElement, itemData);
        });
    }
    setTimeout(updateLikeButtonState, 100);
}


function toggleLikedFeed(event) {
    event.preventDefault();

    isLikedFeedActive = !isLikedFeedActive;

    if (isLikedFeedActive) {
        console.log('Switching to liked feed.');
        mainFeedScrollPosition = feedContainer.scrollTop;
        feedContainer.classList.add('hidden');
        likedFeedContainer.classList.remove('hidden');
        renderLikedFeed();
        likedFeedContainer.scrollTop = 0; 
    } else {
        console.log('Switching back to main feed.');
        likedFeedContainer.classList.add('hidden');
        feedContainer.classList.remove('hidden');
        feedContainer.scrollTop = mainFeedScrollPosition;
    }
    setTimeout(updateLikeButtonState, 100);
}


async function fetchAndQueueItems() {
    if (isFetching) return;
    isFetching = true;
    console.log('Fetching new items...');

    try {
        const promises = [];
        const BATCH_REQUEST_SIZE = 3; // Request smaller chunks from each source

        // 1. Fetch AI-generated prompts
        promises.push(fetchNewPrompts(user, BATCH_REQUEST_SIZE));

        // 2. Fetch projects from followed users
        if (user && hasMoreFollowedProjects) {
            promises.push(fetchFollowingProjects(user, BATCH_REQUEST_SIZE, followingCursor));
        }

        // 3. Fetch trending projects for discovery
        if (hasMoreTrendingProjects) {
            promises.push(fetchTrendingProjects(BATCH_REQUEST_SIZE, trendingOffset));
        }

        if (promises.length === 1) { // Only fetching AI prompts, maybe we are out of other content
             console.log("Only fetching AI prompts. Other sources might be exhausted.");
        }

        const results = await Promise.allSettled(promises);
        
        const newItems = [];
        
        results.forEach(result => {
            if (result.status === 'rejected' || !result.value) {
                console.error("A fetch operation failed:", result.reason || "No value");
                return;
            }

            const data = result.value;

            // Handle AI prompts (returns an array of strings)
            if (Array.isArray(data)) { 
                newItems.push(...data.map(p => ({ type: 'generated', data: p })));
                return;
            }

            // Handle project results (following or trending)
            if (data.source && data.projects) {
                const fetchedProjects = data.projects;
                
                if (data.source === 'following') {
                    followingCursor = data.meta?.end_cursor;
                    hasMoreFollowedProjects = data.meta?.has_next_page ?? false;
                    if (!hasMoreFollowedProjects && user && !endOfFollowedMessageShown) {
                        showEndOfFollowedProjectsMessage();
                        endOfFollowedMessageShown = true;
                    }
                } else if (data.source === 'trending') {
                    if (fetchedProjects.length > 0 && data.meta) {
                        trendingOffset = data.meta.offset + data.meta.limit;
                    } else {
                        hasMoreTrendingProjects = false;
                        console.log("No more trending projects to fetch.");
                    }
                }

                const uniqueNewProjects = fetchedProjects.filter(p => {
                    if (!p?.project?.id || !p.site?.prompt?.text) return false;
                    if (processedProjectIds.has(p.project.id)) {
                        return false;
                    }
                    return true;
                });

                uniqueNewProjects.forEach(p => processedProjectIds.add(p.project.id));
                newItems.push(...uniqueNewProjects.map(p => ({ type: 'project', data: p })));
            }
        });

        if (newItems.length > 0) {
            // Shuffle the newly fetched items to mix sources
            for (let i = newItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
            }

            itemsQueue.push(...newItems);
            console.log(`Added ${newItems.length} new items. Queue size: ${itemsQueue.length}`);
        } else {
            console.log("No new items were added to the queue in this fetch cycle.");
        }

    } catch (e) {
        console.error('Error fetching more items:', e);
    } finally {
        isFetching = false;
    }
}

async function createAndAppendItem() {
    if (itemsQueue.length < MIN_AHEAD_BUFFER && !isFetching) { 
        fetchAndQueueItems(); // No await, let it run in background
    }
    
    if (itemsQueue.length === 0) {
        if (!isFetching) await fetchAndQueueItems(); // If still empty, wait for one fetch
        if (itemsQueue.length === 0) {
            console.log("Queue is still empty after fetch. Cannot create item.");
            // Optionally show a message that content is temporarily unavailable
            return; 
        }
    }

    const item = itemsQueue.shift();
    if (!item) return;

    let itemData;

    if (item.type === 'generated') {
        const prompt = item.data;
        const itemElement = createFeedItemElement(user, null, feedContainer);
        
        const emojiPrompt = await convertToEmojiPrompt(prompt);
        
        itemData = {
            id: `gen_${Date.now()}_${Math.random()}`,
            type: 'generated',
            prompts: [{ text: prompt, emoji: emojiPrompt }],
            summaryEmoji: emojiPrompt,
            project: null,
            user: user ? {
                username: user.username,
                avatar_url: user.avatar_url
            } : null
        };
        updateFeedItem(itemElement, itemData);
    } else if (item.type === 'project') {
        const projectData = item.data;
        const author = projectData.project.created_by;
        const project = projectData.project;
        
        const itemElement = createFeedItemElement(author, project, feedContainer);

        try {
            const promptsText = await getProjectPrompts(project.id);
            if (promptsText.length === 0) {
                console.warn(`No prompts found for project ${project.id}, skipping.`);
                itemElement.parentElement.remove(); // Clean up empty element
                return;
            }

            const summaryEmoji = await summarizeAndConvertToEmoji(promptsText, pageHtmlContent);
            
            const promptDetails = await Promise.all(promptsText.map(async text => ({
                text,
                emoji: await convertToEmojiPrompt(text)
            })));
            
            itemData = {
                id: project.id,
                type: 'project',
                prompts: promptDetails,
                summaryEmoji: summaryEmoji,
                project: {
                    id: project.id,
                    title: project.title,
                },
                user: {
                    username: author.username,
                    avatar_url: author.avatar_url
                }
            };
            updateFeedItem(itemElement, itemData);
        } catch (e) {
            console.error(`Failed to process project ${project.id}`, e);
            itemElement.parentElement.remove(); // Clean up failed element
        }
    }
}

async function handleScroll() {
    updateLikeButtonState();

    if (isFetching || isLikedFeedActive) return;

    const totalItems = feedContainer.children.length;
    const currentItemIndex = Math.round(feedContainer.scrollTop / window.innerHeight);
    const remainingItems = totalItems - currentItemIndex - 1;

    if (remainingItems < MIN_AHEAD_BUFFER) {
        const itemsToCreate = MIN_AHEAD_BUFFER - remainingItems;
        console.log(`Buffer low (${remainingItems} remaining), creating ${itemsToCreate} new items.`);
        
        const creationPromises = [];
        for (let i = 0; i < itemsToCreate; i++) {
            creationPromises.push(createAndAppendItem());
        }
        await Promise.all(creationPromises);
    }
}

async function main() {
    pageHtmlContent = document.documentElement.outerHTML;
    loadLikedItems(); // Load likes from storage at startup

    likeButton.addEventListener('click', likeCurrentItem);
    likeButton.addEventListener('contextmenu', toggleLikedFeed);
    initializeModal();

    try {
        user = await websim.getUser();
        if (user) {
            showLoading(`Building your personalized emoji feed, @${user.username}...`);
        } else {
            showLoading('Building your emoji feed...');
        }
    } catch (e) {
        console.log("Could not get user, continuing as anonymous.");
        showLoading('Building your emoji feed...');
    }
    
    await fetchAndQueueItems();

    if (itemsQueue.length === 0) {
        showFinalError('Could not generate feed. Please try again later.');
        return;
    }
    
    const initialItemsCount = Math.min(3, itemsQueue.length); // Start with fewer items due to processing
    const initialPromises = [];
    for (let i = 0; i < initialItemsCount; i++) {
        initialPromises.push(createAndAppendItem());
    }
    await Promise.all(initialPromises);
    
    hideLoading();

    feedContainer.addEventListener('scroll', handleScroll, {
        passive: true
    });
    likedFeedContainer.addEventListener('scroll', updateLikeButtonState, {
        passive: true
    });

    // Initial check for like button state
    updateLikeButtonState();
}

main();