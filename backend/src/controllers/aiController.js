const { generateText } = require('../services/geminiService');
const prisma = require('../utils/prismaClient');
const pdfParse = require('pdf-parse');

// Rate limiting check using Redis (fallback if Redis not available)
const checkRateLimit = async (userId) => {
    try {
        const redis = require('../utils/redisClient');
        if (!redis) return true;
        const key = `ai_rate:${userId}`;
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, 60); // 60 second window
        return count <= 10;
    } catch {
        return true; // If Redis unavailable, allow request
    }
};

// POST /api/ai/generate-bio
const generateBio = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit: max 10 AI requests per minute' });
        }
        const { skills, interests, department, year } = req.body;
        const prompt = `Write a professional 2-sentence college student bio for a ${year || req.user.year} year ${department || req.user.department} student who knows ${(skills || req.user.skills || []).join(', ')} and is interested in ${(interests || req.user.interests || []).join(', ')}. Keep it friendly and under 100 words.`;
        const bio = await generateText(prompt);
        res.json({ success: true, data: { bio: bio.trim() } });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/blog-outline
const generateBlogOutline = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit: max 10 AI requests per minute' });
        }
        const { topic } = req.body;
        const prompt = `Create a blog post title and 5-section outline for a college student writing about: "${topic}". Format your response as valid JSON with this exact structure: {"title": "...", "outline": [{"heading": "...", "description": "..."}]}`;
        const raw = await generateText(prompt);
        // Strip markdown code fences if present
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch { parsed = { title: topic, outline: [], raw }; }
        res.json({ success: true, data: parsed });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/cover-letter
const generateCoverLetter = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { skills, company, role } = req.body;
        const prompt = `Write a professional internship cover letter for a college student applying to ${company} for the role of ${role}. Their skills include: ${skills}. Keep it under 200 words. Make it personalized and compelling.`;
        const letter = await generateText(prompt);
        res.json({ success: true, data: { coverLetter: letter.trim() } });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/team-description
const generateTeamDescription = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { projectName, rolesNeeded } = req.body;
        const prompt = `Write a compelling 2-3 sentence team description for a college hackathon team working on "${projectName}" that needs the following roles: ${Array.isArray(rolesNeeded) ? rolesNeeded.join(', ') : rolesNeeded}. Make it exciting and clear about what the team is building.`;
        const description = await generateText(prompt);
        res.json({ success: true, data: { description: description.trim() } });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/chat - FestBot
const festbotChat = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { message, history } = req.body;
        const systemContext = `You are LinkUp Bot, a helpful assistant for LinkUp, a college networking app. Help students with networking, finding teams, understanding the platform, and event guidance. Features include: Discover (find other students + match scores), Team Finder, Events, Chat, Leaderboard, Marketplace (buy/sell/rent items), Grow Hub (blogs, internship guides, mentors), Societies (follow college orgs), and AI tools. Be concise, friendly, and use 1-2 emojis per response.`;

        const context = (history || []).slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
        const prompt = `${systemContext}\n\nConversation:\n${context}\nuser: ${message}\nFestBot:`;

        const reply = await generateText(prompt);
        res.json({ success: true, data: { reply: reply.trim() } });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/match-explain
const explainMatch = async (req, res, next) => {
    try {
        const { userId1, userId2, matchScore, sharedSkills, matchReasons } = req.body;

        // Check Redis cache
        let cached = null;
        try {
            const redis = require('../utils/redisClient');
            if (redis) {
                const cacheKey = `match:${userId1}:${userId2}`;
                cached = await redis.get(cacheKey);
                if (cached) return res.json({ success: true, data: { explanation: cached, cached: true } });
            }
        } catch {}

        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }

        const prompt = `In one short friendly sentence, explain why two college students with a ${matchScore}% match score would be great connections. They share these skills: ${(sharedSkills || []).join(', ')}. Match reasons: ${(matchReasons || []).join(', ')}. Keep it under 20 words and start with "You both..."`;
        const explanation = await generateText(prompt);

        // Cache for 24 hours
        try {
            const redis = require('../utils/redisClient');
            if (redis) {
                const cacheKey = `match:${userId1}:${userId2}`;
                await redis.setEx(cacheKey, 86400, explanation.trim());
            }
        } catch {}

        res.json({ success: true, data: { explanation: explanation.trim() } });
    } catch (err) {
        next(err);
    }
};
// POST /api/ai/interview-prep
const generateInterviewPrep = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { company, role, skills } = req.body;
        const prompt = `Act as an expert technical recruiter. Generate exactly 5 challenging interview questions (mix of technical and behavioral) for a college student applying to ${company} for the role of ${role}. The student's skills are: ${skills || req.user.skills?.join(', ')}. Format your response as a valid JSON array of objects with simply "question" and "focus" string fields. Example: [{"question": "What is...", "focus": "React"}].`;
        
        const raw = await generateText(prompt);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch { parsed = []; }
        res.json({ success: true, data: parsed });
    } catch (err) {
        next(err);
    }
};

// POST /api/ai/project-ideas
const generateProjectIdeas = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { skills, interests } = req.body;
        const prompt = `As a senior software engineer mentoring a student, suggest exactly 3 unique and impressive portfolio/hackathon project ideas based on these skills: ${skills || req.user.skills?.join(', ')} and interests: ${interests || req.user.interests?.join(', ')}. Format as a valid JSON array of objects with exactly these fields: "title" (string), "description" (1 sentence string), "techStack" (array of strings).`;
        
        const raw = await generateText(prompt);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch { parsed = []; }
        res.json({ success: true, data: parsed });
    } catch (err) {
        console.error('Gemini Project gen error:', err);
        res.status(500).json({ error: true, message: 'Failed to generate project ideas using AI' });
    }
};

// POST /api/ai/event-summary
const summarizeEventReviews = async (req, res, next) => {
    try {
        const { reviews } = req.body;
        if (!reviews || !reviews.length) {
            return res.status(400).json({ error: true, message: 'No reviews provided to summarize' });
        }

        const prompt = `You are LinkUp's advanced summarization AI.
Please read the following user reviews for an event and provide a 2 to 3 sentence extremely concise summary of the general consensus. Highlight one positive note and one piece of constructive feedback if available.
Make it sound professional but friendly. Do not use Markdown, just return plain text.
Reviews to summarize:
${reviews.map(r => `"${r}"`).join('\n')}`;

        const result = await generateText(prompt); // Assuming generateText is the correct function to use here
        const text = result.trim(); // Assuming generateText returns the text directly or needs trimming

        res.json({ success: true, data: text });
    } catch (err) {
        console.error('Gemini Review summary error:', err);
        res.status(500).json({ error: true, message: 'Failed to generate review summary using AI' });
    }
};

// POST /api/ai/parse-resume
const parseResumeToProfile = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        if (!req.file) {
            return res.status(400).json({ error: true, message: 'No PDF file uploaded' });
        }
        
        const pdfData = await pdfParse(req.file.buffer);
        const text = pdfData.text;

        const prompt = `You are an expert tech recruiter parsing a student's resume.
Extract their information into this exact JSON format:
{
    "bio": "A 2-3 sentence professional summary based on their experience.",
    "skills": ["skill1", "skill2"],
    "interests": ["interest 1", "interest 2"]
}
Only extract technical or relevant professional skills and interests. Max 10 skills.
Return ONLY valid JSON.
Resume text:
${text.substring(0, 3000)}`; // limit token size just in case

        const raw = await generateText(prompt);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch { parsed = { bio: '', skills: [], interests: [] }; }
        res.json({ success: true, data: parsed });
    } catch (err) {
        console.error('Gemini Resume Parse Error:', err);
        res.status(500).json({ error: true, message: 'Failed to parse resume' });
    }
};

// POST /api/ai/generate-icebreakers
const generateIcebreakers = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { targetUserId } = req.body;
        
        // Fetch target user data
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { name: true, skills: true, interests: true, department: true }
        });
        
        if (!targetUser) return res.status(404).json({ error: true, message: 'User not found' });

        const me = req.user;
        
        const prompt = `You are an AI helping a college student "${me.name}" send a first connection message to another student "${targetUser.name}".
My skills/interests: ${(me.skills||[]).join(', ')} / ${(me.interests||[]).join(', ')}. My dept: ${me.department}.
Their skills/interests: ${(targetUser.skills||[]).join(', ')} / ${(targetUser.interests||[]).join(', ')}. Their dept: ${targetUser.department}.

Write exactly 3 distinct, short (1-2 sentences), friendly DMs I could send them right now to break the ice. Focus on shared interests, skills, or departments if any exist. Use emojis.
Format as a valid JSON array of strings. Example: ["Hey! I saw we both love Python...", "Hi..."]`;

        const raw = await generateText(prompt);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch { parsed = []; }
        res.json({ success: true, data: parsed });
    } catch (err) {
        console.error('Gemini Icebreaker Error:', err);
        res.status(500).json({ error: true, message: 'Failed to generate icebreakers' });
    }
};

// POST /api/ai/marketplace-listing
const generateMarketplaceListing = async (req, res, next) => {
    try {
        if (!(await checkRateLimit(req.user.id))) {
            return res.status(429).json({ error: true, message: 'Rate limit exceeded' });
        }
        const { rawKeywords } = req.body;
        
        const prompt = `You are an AI assisting a student in selling an item on a college marketplace.
The user typed these rough keywords: "${rawKeywords}"
Generate a professional, catchy listing title and a descriptive, persuasive body description.
Format as valid JSON: {"title": "...", "description": "..."}`;

        const raw = await generateText(prompt);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch { parsed = { title: rawKeywords, description: '' }; }
        res.json({ success: true, data: parsed });
    } catch (err) {
        console.error('Gemini Marketplace Lister Error:', err);
        res.status(500).json({ error: true, message: 'Failed to auto-generate listing' });
    }
};

module.exports = { 
    generateBio, 
    generateBlogOutline, 
    generateCoverLetter, 
    festbotChat,
    explainMatch, 
    generateTeamDescription, 
    generateInterviewPrep, 
    generateProjectIdeas,
    summarizeEventReviews,
    parseResumeToProfile,
    generateIcebreakers,
    generateMarketplaceListing
};
