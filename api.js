function convertShortcodesToEmoji(text) {
    // A comprehensive map to convert common emoji shortcodes to their unicode characters.
    const shortcodeMap = {
        'blue_heart': '💙', 'green_heart': '💚', 'purple_heart': '💜', 'heart': '❤️', 'red_heart': '❤️', 
        'yellow_heart': '💛', 'orange_heart': '🧡', 'black_heart': '🖤', 'white_heart': '🤍', 'brown_heart': '🤎',
        'sparkles': '✨', 'fire': '🔥', 'rocket': '🚀', 'star': '⭐', 'star2': '🌟', 'thumbsup': '👍', '+1': '👍',
        'thumbsdown': '👎', '-1': '👎', 'clap': '👏', 'wave': '👋', 'smile': '😄', 'joy': '😂', 'wink': '😉',
        'blush': '😊', 'thinking': '🤔', 'brain': '🧠', 'robot': '🤖', 'alien': '👽', 'ghost': '👻', 'skull': '💀',
        'art': '🎨', 'paintbrush': '🖌️', 'camera': '📷', 'movie_camera': '🎥', 'computer': '💻', 'floppy_disk': '💾',
        'crystal_ball': '🔮', 'gem': '💎', 'ring': '💍', 'moneybag': '💰', 'light_bulb': '💡', 'zap': '⚡', 'boom': '💥',
        'sweat_drops': '💦', 'droplet': '💧', 'cloud': '☁️', 'sun_behind_cloud': '⛅', 'rainbow': '🌈', 'full_moon': '🌕',
        'new_moon': '🌑', 'earth_americas': '🌎', 'earth_africa': '🌍', 'earth_asia': '🌏', 'volcano': '🌋',
        'mountain': '⛰️', 'desert_island': '🏝️', 'deciduous_tree': '🌳', 'four_leaf_clover': '🍀', 'seedling': '🌱',
        'rose': '🌹', 'mushroom': '🍄', 'eyes': '👀', 'tongue': '👅', 'lips': '👄', 'hand': '✋', 'fist': '✊',
        'v': '✌️', 'ok_hand': '👌', 'point_up': '☝️', 'point_down': '👇', 'point_left': '👈', 'point_right': '👉',
        'pray': '🙏', 'muscle': '💪', 'man': '👨', 'woman': '👩', 'boy': '👦', 'girl': '👧', 'older_man': '👴',
        'older_woman': '👵', 'cop': '👮', 'construction_worker': '👷', 'angel': '👼', 'princess': '👸', 'dancer': '💃',
        'cat': '🐱', 'dog': '🐶', 'horse': '🐴', 'monkey_face': '🐵', 'dragon': '🐉', 'whale': '🐳', 'bird': '🐦',
        'fish': '🐠', 'bug': '🐛', 'snail': '🐌', 'octopus': '🐙', 'game_die': '🎲', 'video_game': '🎮',
        'joystick': '🕹️', 'dart': '🎯', 'trophy': '🏆', 'soccer': '⚽', 'basketball': '🏀', 'football': '🏈',
        'baseball': '⚾', 'tennis': '🎾', 'car': '🚗', 'ship': '🚢', 'airplane': '✈️', 'house': '🏠', 'office': '🏢',
        'castle': '🏰', 'clock': '⏰', 'hourglass': '⌛', 'phone': '☎️', 'sound': '🔊', 'musical_note': '🎵',
        'key': '🔑', 'lock': '🔒', 'unlock': '🔓', 'hammer': '🔨', 'wrench': '🔧', 'knife': '🔪', 'gun': '🔫',
        'bomb': '💣', 'pill': '💊', 'syringe': '💉', 'money_with_wings': '💸', 'credit_card': '💳', 'envelope': '✉️',
        'scroll': '📜', 'book': '📖', 'notebook': '📓', 'link': '🔗', 'pushpin': '📌', 'scissors': '✂️', 'mag': '🔍',
        'mag_right': '🔎', 'one': '1️⃣', 'two': '2️⃣', 'three': '3️⃣', 'four': '4️⃣', 'five': '5️⃣', 'six': '6️⃣',
        'seven': '7️⃣', 'eight': '8️⃣', 'nine': '9️⃣', 'zero': '0️⃣', 'hash': '#️⃣', 'arrow_up': '⬆️', 'arrow_down': '⬇️',
        'arrow_left': '⬅️', 'arrow_right': '➡️', 'heavy_plus_sign': '➕', 'heavy_minus_sign': '➖',
        'heavy_division_sign': '➗', 'heavy_multiplication_x': '✖️', 'heavy_check_mark': '✔️', 'x': '❌',
        'negative_squared_cross_mark': '❎', 'question': '❓', 'grey_question': '❔', 'exclamation': '❗',
        'grey_exclamation': '❕', 'tm': '™️', 'copyright': '©️', 'registered': '®️'
    };

    if (!text || typeof text !== 'string') {
        return text;
    }

    // This regex will find all substrings like :shortcode: and replace them.
    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortcode) => {
        return shortcodeMap[shortcode] || match;
    });
}

function filterToEmojiOnly(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    // This regex matches various emoji characters and sequences, including ZWJ sequences and skin tone modifiers.
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    
    // First, convert shortcodes to actual emojis
    let processedText = convertShortcodesToEmoji(text);

    // Then, remove any characters that are not part of the emoji regex.
    // We allow spaces and some joiners to preserve structure.
    return processedText.replace(/([^\s\u200d]|[^a-zA-Z0-9_])+/g, (match) => {
        if (match.match(emojiRegex)) {
            return match;
        }
        // If a segment contains non-emoji text, clean it by removing letters/numbers.
        // This is a bit aggressive but helps clean up words like "architects".
        const cleaned = match.replace(/[a-zA-Z0-9]+/g, '');
        // Only return if there's something left after cleaning
        return cleaned.trim().length > 0 ? cleaned : '';
    }).replace(/::/g, ':'); // Fix potential double colons from shortcode replacement
}

async function getUserInterests(currentUser) {
    if (!currentUser) return 'The user is anonymous. Generate prompts based on generally popular, trending, and visually spectacular creative themes.';
    let interests = [];
    const MAX_INTERESTS = 50;

    try {
        const userProjectsResponse = await fetch(`/api/v1/users/${currentUser.username}/projects?first=10&posted=true&sort_by=updated_at`);
        if (userProjectsResponse.ok) {
            const userProjects = await userProjectsResponse.json();
            userProjects.projects.data.forEach(p => {
                if (p.project.title) interests.push(p.project.title);
                if (p.site?.prompt?.text) interests.push(p.site.prompt.text);
            });
        }
    } catch (e) {
        console.error("Couldn't fetch user projects:", e);
    }

    try {
        const likedResponse = await fetch(`/api/v1/users/${currentUser.username}/likes?first=10`);
        if (likedResponse.ok) {
            const likedData = await likedResponse.json();
            likedData.likes.data.forEach(l => {
                if (l.project?.title) interests.push(l.project.title);
                if (l.site?.prompt?.text) interests.push(l.site.prompt.text);
            });
        }
    } catch(e) {
        console.error("Couldn't fetch user likes:", e);
    }
    
    // Limit total interests processed to avoid overly long summary prompts
    const uniqueInterests = [...new Set(interests)].slice(0, MAX_INTERESTS);

    if (uniqueInterests.length > 0) {
        try {
            const completion = await websim.chat.completions.create({
                messages: [{
                    role: 'system',
                    content: 'You are an assistant that summarizes a list of topics and prompts into a concise list of key themes and interests. Extract the core concepts. Respond with a comma-separated list of no more than 10-15 key themes.'
                }, {
                    role: 'user',
                    content: `Here is a list of project titles and prompts from a user: ${uniqueInterests.join(', ')}`

                }],
            });
            return `The user has shown interest in the following topics: ${completion.content}.`;
        } catch(e) {
            console.error("Error summarizing interests, using raw data:", e);
            return `The user has shown interest in: ${uniqueInterests.slice(0, 20).join(', ')}.`;
        }
    }

    return `The user's username is '${currentUser.username}' and their description is '${currentUser.description}'. They haven't created or liked projects yet, so generate prompts based on generally popular and trending creative themes.`;
}

export async function fetchNewPrompts(currentUser, count) {
    console.log('Fetching new personalized prompts...');
    try {
        const userInterestSummary = await getUserInterests(currentUser);
        
        const completion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: `You are a creative prompt generator for an AI image model, but the goal is to create interesting text prompts. Your goal is to create a personalized, engaging, and endless vertical social media feed for a user.
                ${userInterestSummary}
                Based on this, generate ${count} unique and diverse text prompts for visually stunning images. The prompts should be imaginative, ranging from fantasy landscapes to futuristic cityscapes, abstract art, and surreal concepts, while being tailored to the user's inferred interests. Also, introduce some related but new concepts to keep the feed fresh.
                Respond with a JSON object following this schema: { "prompts": ["prompt1", "prompt2", ...] }`,
            }, {
                role: 'user',
                content: `Generate ${count} prompts.`,
            }],
            json: true,
        });

        const result = JSON.parse(completion.content);
        if (result.prompts && Array.isArray(result.prompts)) {
            console.log(`Fetched ${result.prompts.length} new personalized prompts.`);
            return result.prompts;
        }
        return [];
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return ["A neon-lit cyberpunk city street in the rain, with flying cars"];
    }
}

export async function fetchFollowingProjects(currentUser, count, afterCursor = null) {
    if (!currentUser) return { projects: [], meta: null };
    try {
        console.log(`Fetching projects from users followed by @${currentUser.username}...`);
        const url = `/api/v1/users/${currentUser.username}/following/projects?first=${count}&posted=true&sort_by=updated_at${afterCursor ? `&after=${afterCursor}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch following projects: ${response.status}`);
        }
        const data = await response.json();
        if (data.projects && data.projects.data) {
            console.log(`Fetched ${data.projects.data.length} projects from followed users.`);
            return { projects: data.projects.data, meta: data.projects.meta };
        }
        return { projects: [], meta: null };
    } catch (error) {
        console.error('Error fetching following projects:', error);
        return { projects: [], meta: null };
    }
}

export async function convertToEmojiPrompt(text) {
    try {
        const completion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: 'You are an AI that masterfully converts a text prompt into a visually representative sequence of emojis. Create a detailed and expressive emoji string that captures the essence of the prompt. Respond with ONLY emojis. Do not use any other characters or text. Do not use emoji shortcodes like :heart: or :smile:, use the actual Unicode characters.'
            }, {
                role: 'user',
                content: `Convert the following text prompt to emojis: "${text}"`
            }],
        });
        const rawContent = completion.content || '❓';
        return filterToEmojiOnly(rawContent);
    } catch (e) {
        console.error('Error converting to emoji:', e);
        return '🚧';
    }
}

export async function getProjectPrompts(projectId) {
    try {
        const response = await fetch(`/api/v1/projects/${projectId}/revisions?first=100`);
        if (!response.ok) throw new Error(`Failed to fetch revisions for project ${projectId}`);
        const data = await response.json();
        const prompts = data.revisions.data
            .map(r => r.project_revision?.site?.prompt?.text)
            .filter(Boolean); // Filter out null/undefined prompts
        return [...new Set(prompts)].reverse(); // Unique prompts, chronological order
    } catch (e) {
        console.error('Error fetching project prompts:', e);
        return [];
    }
}

export async function summarizeAndConvertToEmoji(prompts, pageHtml) {
    if (!prompts || prompts.length === 0) return '🤔';
    
    const first5 = prompts.slice(0, 5);
    const mostRecent10 = prompts.slice(-10);

    const promptData = {
        first_5: first5,
        most_recent_10: mostRecent10
    };
    
    try {
        const completion = await websim.chat.completions.create({
            messages: [{
                role: 'system',
                content: `You are an expert emoji artist. Your task is to analyze a user's project prompt history and the project's current HTML structure to create a single, detailed, and narrative summary prompt written exclusively with emojis. This emoji prompt should tell a story, capturing the theme, evolution, and key elements of the project. Do not just list random emojis; create a coherent visual sentence. Be expressive and detailed. Respond with ONLY the emoji string, nothing else. Do not use emoji shortcodes like :heart:, use the actual Unicode characters.`
            }, {
                role: 'user',
                content: JSON.stringify({
                    context: "Here is the HTML of the page where these prompts are used, and a list of the user's first and most recent prompts for a project.",
                    html_context: pageHtml,
                    prompts: promptData
                })
            }],
        });
        const rawContent = completion.content || '✨';
        return filterToEmojiOnly(rawContent);
    } catch (e) {
        console.error("Error summarizing to emoji:", e);
        // Fallback: convert the last prompt to emoji
        return await convertToEmojiPrompt(prompts[prompts.length - 1]);
    }
}