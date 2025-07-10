const emojiConverter = new window.EmojiConvertor();
emojiConverter.allow_native = true;

function replaceEmojiShortcodes(text) {
    if (!text) return '';
    return emojiConverter.replace_colons(text);
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
                content: 'You are an AI that masterfully converts a text prompt into a visually representative sequence of emojis. Create a detailed and expressive emoji string that captures the essence of the prompt. Respond with ONLY emojis. Do not use any other characters or text.'
            }, {
                role: 'user',
                content: `Convert the following text prompt to emojis: "${text}"`
            }],
        });
        return replaceEmojiShortcodes(completion.content || '❓');
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
                content: `You are an expert emoji artist. Your task is to analyze a user's project prompt history and the project's current HTML structure to create a single, detailed, and narrative summary prompt written exclusively with emojis. This emoji prompt should tell a story, capturing the theme, evolution, and key elements of the project. Do not just list random emojis; create a coherent visual sentence. Be expressive and detailed. Respond with ONLY the emoji string, nothing else.`
            }, {
                role: 'user',
                content: JSON.stringify({
                    context: "Here is the HTML of the page where these prompts are used, and a list of the user's first and most recent prompts for a project.",
                    html_context: pageHtml,
                    prompts: promptData
                })
            }],
        });
        return replaceEmojiShortcodes(completion.content || '✨');
    } catch (e) {
        console.error("Error summarizing to emoji:", e);
        // Fallback: convert the last prompt to emoji
        return await convertToEmojiPrompt(prompts[prompts.length - 1]);
    }
}