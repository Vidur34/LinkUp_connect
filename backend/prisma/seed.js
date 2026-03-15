const bcrypt = require('bcryptjs');

const prisma = require('./utils/prismaClient');

const seed = async () => {
    console.log('🌱 Seeding LinkUp v2.0 database...');

    // Clear in dependency order
    await prisma.skillEndorsement.deleteMany();
    await prisma.guideVote.deleteMany();
    await prisma.internshipGuide.deleteMany();
    await prisma.blogVote.deleteMany();
    await prisma.blogComment.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.eventReview.deleteMany();
    await prisma.pastEventEdition.deleteMany();
    await prisma.orgFollow.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.marketplaceListing.deleteMany();
    await prisma.eventJoin.deleteMany();
    await prisma.event.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.organisation.deleteMany();
    await prisma.user.deleteMany();

    const password = await bcrypt.hash('pass123', 10);

    // Create 10 student users
    const users = await Promise.all([
        prisma.user.create({ data: { name: 'Arjun Sharma', email: 'arjun@fest.com', password, accountType: 'student', department: 'CSE', year: 3, skills: ['AI', 'Web Dev', 'Python'], interests: ['Coding', 'Gaming', 'Music'], bio: 'Passionate about AI and building cool stuff!', networkingScore: 85, isOpenToMentor: true, mentorSkills: ['Python', 'Web Dev'], mentorBio: 'Happy to help juniors with Python and Web Dev.' } }),
        prisma.user.create({ data: { name: 'Priya Patel', email: 'priya@fest.com', password, accountType: 'student', department: 'ECE', year: 2, skills: ['IoT', 'Cybersecurity', 'C++'], interests: ['Robotics', 'Photography', 'Dance'], bio: 'IoT enthusiast trying to connect the physical world.', networkingScore: 72 } }),
        prisma.user.create({ data: { name: 'Rahul Mehta', email: 'rahul@fest.com', password, accountType: 'student', department: 'CSE', year: 4, skills: ['AI', 'ML', 'Python', 'TensorFlow'], interests: ['Coding', 'Research', 'Chess'], bio: 'ML researcher, published 2 papers.', networkingScore: 95, isOpenToMentor: true, mentorSkills: ['AI', 'ML', 'TensorFlow'], mentorBio: 'Senior student specialising in ML. Ask me about research!' } }),
        prisma.user.create({ data: { name: 'Anjali Singh', email: 'anjali@fest.com', password, accountType: 'student', department: 'Design', year: 2, skills: ['UI/UX', 'Figma', 'Illustration'], interests: ['Art', 'Photography', 'Dance'], bio: 'Designing experiences that matter.', networkingScore: 60 } }),
        prisma.user.create({ data: { name: 'Kiran Reddy', email: 'kiran@fest.com', password, accountType: 'student', department: 'MBA', year: 1, skills: ['Marketing', 'Strategy', 'Excel'], interests: ['Business', 'Cricket', 'Music'], bio: 'Aspiring entrepreneur with a knack for strategy.', networkingScore: 55 } }),
        prisma.user.create({ data: { name: 'Sneha Iyer', email: 'sneha@fest.com', password, accountType: 'student', department: 'CSE', year: 3, skills: ['Web Dev', 'React', 'Node.js'], interests: ['Coding', 'Music', 'Books'], bio: 'Full-stack developer who loves open source.', networkingScore: 78 } }),
        prisma.user.create({ data: { name: 'Dev Gupta', email: 'dev@fest.com', password, accountType: 'student', department: 'Mechanical', year: 3, skills: ['CAD', 'Robotics', 'C++'], interests: ['Robotics', 'Gaming', 'Tinkering'], bio: 'Building robots one screw at a time.', networkingScore: 48 } }),
        prisma.user.create({ data: { name: 'Nisha Kapoor', email: 'nisha@fest.com', password, accountType: 'student', department: 'ECE', year: 4, skills: ['VLSI', 'Verilog', 'IoT'], interests: ['Electronics', 'Photography', 'Travel'], bio: 'Chip design enthusiast and travel lover.', networkingScore: 66 } }),
        prisma.user.create({ data: { name: 'Aditya Roy', email: 'aditya@fest.com', password, accountType: 'student', department: 'CSE', year: 2, skills: ['Python', 'Cybersecurity', 'Linux'], interests: ['Coding', 'CTF', 'Gaming'], bio: 'CTF player and ethical hacker in training.', networkingScore: 82 } }),
        prisma.user.create({ data: { name: 'Meera Nair', email: 'meera@fest.com', password, accountType: 'student', department: 'Design', year: 3, skills: ['UI/UX', 'Figma', 'Motion Design'], interests: ['Art', 'Dance', 'Books'], bio: 'Creating beautiful interfaces and motion art.', networkingScore: 70 } }),
    ]);
    console.log(`✅ Created ${users.length} student users`);

    // Create 2 organisations (TechClub with 120 followers = verified, CulturalSociety with 150 followers = verified)
    const orgs = await Promise.all([
        prisma.organisation.create({
            data: {
                name: 'TechClub NITS',
                email: 'techclub@fest.com',
                password,
                category: 'Technical',
                description: 'The largest technical society on campus. We run hackathons, workshops, and coding contests.',
                followers: 120,
                isVerified: true,
                instagramHandle: 'techclub_nits',
                websiteUrl: 'https://techclub.nits.ac.in',
            },
        }),
        prisma.organisation.create({
            data: {
                name: 'Cultural Society',
                email: 'cultural@fest.com',
                password,
                category: 'Cultural',
                description: 'Celebrating the vibrant cultural diversity of our campus through dance, music, and art.',
                followers: 150,
                isVerified: true,
                instagramHandle: 'cultural_nits',
            },
        }),
    ]);
    console.log(`✅ Created ${orgs.length} organisations`);

    // Events (some linked to orgs, some recurring)
    const now = new Date('2026-03-14T23:52:00+05:30');
    const events = await Promise.all([
        prisma.event.create({ data: { name: 'Hackathon 2026', description: '36-hour coding marathon to build innovative solutions', venue: 'Main Auditorium', startTime: new Date(now.getTime() + 2 * 86400000), endTime: new Date(now.getTime() + 3.5 * 86400000), category: 'Technical', maxCapacity: 200, eventSlug: 'hackathon', isRecurring: true, orgId: orgs[0].id } }),
        prisma.event.create({ data: { name: 'TechTalk: AI in 2026', description: 'Panel discussion on the future of Artificial Intelligence', venue: 'Seminar Hall A', startTime: new Date(now.getTime() + 86400000), endTime: new Date(now.getTime() + 86400000 + 3 * 3600000), category: 'Technical', maxCapacity: 150, orgId: orgs[0].id } }),
        prisma.event.create({ data: { name: 'Battle of Bands', description: 'Compete and showcase your musical talent', venue: 'Open Air Theatre', startTime: new Date(now.getTime() + 3 * 86400000), endTime: new Date(now.getTime() + 3 * 86400000 + 5 * 3600000), category: 'Cultural', maxCapacity: 500, eventSlug: 'battle-of-bands', isRecurring: true, orgId: orgs[1].id } }),
        prisma.event.create({ data: { name: 'Business Plan Competition', description: 'Pitch your startup idea to real investors', venue: 'Conference Room B', startTime: new Date(now.getTime() + 4 * 86400000), endTime: new Date(now.getTime() + 4 * 86400000 + 6 * 3600000), category: 'Business', maxCapacity: 80 } }),
        prisma.event.create({ data: { name: 'Valorant Tournament', description: 'Inter-college gaming championship', venue: 'Gaming Lab', startTime: new Date(now.getTime() + 5 * 86400000), endTime: new Date(now.getTime() + 6 * 86400000), category: 'Gaming', maxCapacity: 64 } }),
        prisma.event.create({ data: { name: 'Art & Photography Expo', description: 'Showcase your creative works', venue: 'Gallery Hall', startTime: new Date(now.getTime() + 2 * 86400000), endTime: new Date(now.getTime() + 4 * 86400000), category: 'Creative', maxCapacity: 300 } }),
        prisma.event.create({ data: { name: 'Robotics Challenge', description: 'Build and race autonomous robots', venue: 'Engineering Block', startTime: new Date(now.getTime() + 6 * 86400000), endTime: new Date(now.getTime() + 6 * 86400000 + 8 * 3600000), category: 'Technical', maxCapacity: 60 } }),
        prisma.event.create({ data: { name: 'Dance Nite', description: 'Biggest dance competition of the fest', venue: 'Main Stage', startTime: new Date(now.getTime() + 7 * 86400000), endTime: new Date(now.getTime() + 7 * 86400000 + 4 * 3600000), category: 'Cultural', maxCapacity: 400, orgId: orgs[1].id } }),
    ]);
    console.log(`✅ Created ${events.length} events`);

    // Event joins
    await Promise.all([
        prisma.eventJoin.create({ data: { userId: users[0].id, eventId: events[0].id } }),
        prisma.eventJoin.create({ data: { userId: users[0].id, eventId: events[1].id } }),
        prisma.eventJoin.create({ data: { userId: users[2].id, eventId: events[0].id } }),
        prisma.eventJoin.create({ data: { userId: users[2].id, eventId: events[1].id } }),
        prisma.eventJoin.create({ data: { userId: users[5].id, eventId: events[0].id } }),
        prisma.eventJoin.create({ data: { userId: users[1].id, eventId: events[6].id } }),
        prisma.eventJoin.create({ data: { userId: users[6].id, eventId: events[6].id } }),
        prisma.eventJoin.create({ data: { userId: users[3].id, eventId: events[5].id } }),
        prisma.eventJoin.create({ data: { userId: users[9].id, eventId: events[5].id } }),
        prisma.eventJoin.create({ data: { userId: users[4].id, eventId: events[3].id } }),
    ]);

    // Past event editions for recurring events
    await prisma.pastEventEdition.create({
        data: {
            eventSlug: 'hackathon',
            year: 2025,
            name: 'Hackathon 2025',
            description: 'Previous year hackathon – 36 teams competed.',
            reviews: [
                { user: 'Vikram S.', rating: 5, content: 'Best hackathon I\'ve attended! Amazing problem statements.' },
                { user: 'Pooja M.', rating: 4, content: 'Great organisation. Mentors were super helpful.' },
            ],
        },
    });

    await prisma.pastEventEdition.create({
        data: {
            eventSlug: 'battle-of-bands',
            year: 2025,
            name: 'Battle of Bands 2025',
            description: 'Last year\'s musical extravaganza with 10 bands.',
            reviews: [
                { user: 'Aryan K.', rating: 5, content: 'Incredible performances! Crowd was amazing.' },
            ],
        },
    });

    // Event reviews for past events (users who joined)
    await Promise.all([
        prisma.eventReview.create({ data: { eventId: events[0].id, userId: users[0].id, rating: 5, content: 'Absolutely loved it! The problem statements were challenging and the mentors were brilliant. Stayed up all 36 hours.', year: 2026, helpful: 8 } }),
        prisma.eventReview.create({ data: { eventId: events[0].id, userId: users[2].id, rating: 4, content: 'Great event overall. Logistics could be smoother but the coding environment was top-notch.', year: 2026, helpful: 3 } }),
        prisma.eventReview.create({ data: { eventId: events[0].id, userId: users[5].id, rating: 5, content: 'Won best project! This hackathon really pushed my skills to the limit. Highly recommend.', year: 2026, helpful: 12 } }),
    ]);
    console.log('✅ Created event reviews & past editions');

    // Teams
    const team1 = await prisma.team.create({ data: { name: 'AI Dream Team', description: 'Building an AI-powered campus navigation app for the hackathon', rolesNeeded: ['Frontend Dev', 'ML Engineer', 'UI/UX Designer'], maxSize: 4, creatorId: users[2].id } });
    await prisma.teamMember.create({ data: { teamId: team1.id, userId: users[2].id, role: 'Lead / ML Engineer' } });
    await prisma.teamMember.create({ data: { teamId: team1.id, userId: users[0].id, role: 'Backend Dev' } });

    const team2 = await prisma.team.create({ data: { name: 'Robo Warriors', description: 'Competing in the robotics challenge with an autonomous maze solver', rolesNeeded: ['Mechanical Engineer', 'Embedded Dev', 'CAD Designer'], maxSize: 5, creatorId: users[6].id } });
    await prisma.teamMember.create({ data: { teamId: team2.id, userId: users[6].id, role: 'Lead / Mechanical' } });
    await prisma.teamMember.create({ data: { teamId: team2.id, userId: users[1].id, role: 'Embedded Dev' } });

    const team3 = await prisma.team.create({ data: { name: 'StartupSquad', description: 'Building a fintech startup pitch for the Business Plan Competition', rolesNeeded: ['Business Analyst', 'Pitch Designer', 'Finance Expert'], maxSize: 3, creatorId: users[4].id } });
    await prisma.teamMember.create({ data: { teamId: team3.id, userId: users[4].id, role: 'Lead / Strategy' } });
    console.log('✅ Created 3 teams');

    // Connections
    await prisma.connection.create({ data: { senderId: users[0].id, receiverId: users[2].id, status: 'accepted' } });
    await prisma.connection.create({ data: { senderId: users[0].id, receiverId: users[5].id, status: 'accepted' } });
    await prisma.connection.create({ data: { senderId: users[1].id, receiverId: users[7].id, status: 'accepted' } });
    await prisma.connection.create({ data: { senderId: users[3].id, receiverId: users[9].id, status: 'accepted' } });
    await prisma.connection.create({ data: { senderId: users[2].id, receiverId: users[8].id, status: 'pending' } });
    console.log('✅ Created connections');

    // Org follows (TechClub gets 120 follows from users)
    await prisma.orgFollow.create({ data: { studentId: users[0].id, orgId: orgs[0].id } });
    await prisma.orgFollow.create({ data: { studentId: users[2].id, orgId: orgs[0].id } });
    await prisma.orgFollow.create({ data: { studentId: users[5].id, orgId: orgs[0].id } });
    await prisma.orgFollow.create({ data: { studentId: users[1].id, orgId: orgs[1].id } });
    await prisma.orgFollow.create({ data: { studentId: users[3].id, orgId: orgs[1].id } });
    console.log('✅ Created org follows');

    // Marketplace listings
    await Promise.all([
        prisma.marketplaceListing.create({ data: { title: 'Data Structures & Algorithms Textbook', description: 'CLRS 3rd edition. Perfect condition, barely used. Ideal for competitive programming.', price: 350, type: 'sell', category: 'Books', images: [], condition: 'Like New', sellerId: users[0].id } }),
        prisma.marketplaceListing.create({ data: { title: 'Casio fx-991EX Scientific Calculator', description: 'Used for 1 semester. All functions working perfectly.', price: 500, type: 'sell', category: 'Electronics', images: [], condition: 'Good', sellerId: users[2].id } }),
        prisma.marketplaceListing.create({ data: { title: 'Yamaha Classical Guitar', description: 'Great beginner guitar. Comes with bag and picks. Selling since I switched to electric.', price: 150, type: 'rent', rentPerDay: 150, category: 'Instruments', images: [], condition: 'Good', sellerId: users[4].id } }),
        prisma.marketplaceListing.create({ data: { title: 'Sony WH-1000XM4 Earphones', description: 'Noise cancelling, excellent sound quality. Minor scratches on the headband only.', price: 3500, type: 'sell', category: 'Electronics', images: [], condition: 'Good', sellerId: users[7].id } }),
        prisma.marketplaceListing.create({ data: { title: 'Digital Signal Processing Notes (ECE Sem 5)', description: 'Handwritten notes + printed slides from Prof. Mehta. Complete unit coverage.', price: 0, type: 'free', category: 'Books', images: [], condition: 'Good', sellerId: users[1].id } }),
    ]);
    console.log('✅ Created 5 marketplace listings');

    // Blogs by senior students
    await Promise.all([
        prisma.blog.create({ data: { authorId: users[2].id, title: 'How I Got My ML Internship at Flipkart', content: '# My Journey to a Flipkart ML Internship\n\nWhen I started my 3rd year, I had no idea how competitive the internship process would be...\n\n## Preparation\n\nI spent 3 months grinding LeetCode (Medium level) and reading papers on recommendation systems...\n\n## The Interview\n\nRound 1 was a coding test – 3 problems in 90 minutes. The problems were on arrays and graphs.\n\nRound 2 was a technical interview focused on ML fundamentals – gradient descent, overfitting, cross-validation.\n\nRound 3 was an HR round about my projects and motivations.\n\n## Tips\n- Start early (3rd semester onwards)\n- Projects matter more than CGPA\n- Know your tech stack deeply\n- Practice explaining your work simply', tags: ['ML', 'Internship', 'Flipkart', 'Career'], category: 'Internship Journey', upvotes: 42 } }),
        prisma.blog.create({ data: { authorId: users[0].id, title: 'Surviving Your First Hackathon: A Beginner\'s Guide', content: '# Surviving Your First Hackathon\n\nHackathons are intense, but they\'re also the most fun you\'ll have learning!\n\n## Before the Hackathon\n\nForm your team wisely – you need a balance of frontend, backend, and design skills.\n\n## During the Event\n\n**Hour 0-2**: Brainstorm and decide on your idea fast. Don\'t overthink.\n**Hour 2-6**: Set up infrastructure and divide tasks.\n**Hour 6-30**: Build, build, build.\n**Hour 30-36**: Polish the demo and prepare your pitch.\n\n## The Pitch\n\nDemos speak louder than slides. Always have a live working demo.\n\n## After\n\nWin or lose, document what you built. GitHub repos are portfolio gold!', tags: ['Hackathon', 'Tips', 'Teamwork', 'Beginner'], category: 'Fest Experience', upvotes: 28 } }),
        prisma.blog.create({ data: { authorId: users[2].id, title: 'GSoC 2025: From Zero to Getting Selected', content: '# Google Summer of Code – My Journey\n\nI applied to GSoC in my 3rd year and got selected on my first try. Here\'s how.\n\n## Finding the Right Organisation\n\nChoose based on your strongest language and interests. I chose a Python-heavy org doing ML tooling.\n\n## The Proposal\n\nWrite your proposal like a technical spec. Be extremely specific about deliverables and timeline.\n\n## Contributing Before GSoC\n\nSpend 2 months contributing small PRs before the proposal period. This is crucial.\n\n## During the Program\n\nCommunicate proactively. Blog your progress weekly.', tags: ['GSoC', 'Open Source', 'Google', 'Career'], category: 'Career Advice', upvotes: 89 } }),
    ]);
    console.log('✅ Created 3 blogs');

    // Internship guides
    await Promise.all([
        prisma.internshipGuide.create({ data: { company: 'Google', role: 'SWE Intern', year: 2025, stipend: '₹1,10,000/month', duration: '3 months', difficulty: 'Hard', resumeTips: 'Target specific teams. Mention any open source contributions. Quantify your project impact (e.g., "reduced latency by 40%").', applicationProcess: 'Apply via careers.google.com in August. Referrals help significantly. Response time is 2-4 weeks.', interviewRounds: [{ round: 'Online Assessment', description: '2 coding problems in 90 minutes on a custom platform', tips: 'Focus on medium-hard Graph and DP problems' }, { round: 'Technical Round 1', description: 'Problem solving + data structures. Interviewer is a Google engineer.', tips: 'Think out loud. Start with brute force then optimise.' }, { round: 'Technical Round 2', description: 'System design (for SWE role this is lighter – more focus on OOP)', tips: 'Know SOLID principles and design patterns' }], resourceLinks: ['https://leetcode.com/explore/interview/card/google/', 'https://www.geeksforgeeks.org/google-interview-preparation/'], timeline: 'Apply Aug → OA in Sep → Interviews Oct-Nov → Offer Dec → Internship May-Jul', authorId: users[2].id } }),
        prisma.internshipGuide.create({ data: { company: 'Microsoft', role: 'SWE Intern', year: 2025, stipend: '₹85,000/month', duration: '2 months', difficulty: 'Medium', resumeTips: 'Highlight any .NET or Azure experience. GitHub profile matters. CGPA cutoff is generally 7.5+.', applicationProcess: 'Campus placements in October. Off-campus applications via LinkedIn or referrals in November.', interviewRounds: [{ round: 'Technical Round 1', description: '2 DSA problems + OOP concepts', tips: 'Practice arrays, strings, trees on LeetCode. Know C# or Java well.' }, { round: 'Technical Round 2', description: 'Detailed project discussion + problem solving', tips: 'Be ready to deep dive into your most complex project' }, { round: 'HR Round', description: 'Behavioral questions using STAR method', tips: 'Have 3-4 STAR stories ready covering teamwork, failure, and leadership' }], resourceLinks: ['https://careers.microsoft.com/students', 'https://github.com/MicrosoftLearning'], timeline: 'Campus drive Oct → Interviews Nov → Offer Dec → Internship May-Jun', authorId: users[5].id } }),
    ]);
    console.log('✅ Created 2 internship guides');

    // Skill endorsements for mentor users
    const endorsements = await Promise.all([
        prisma.skillEndorsement.create({ data: { mentorId: users[2].id, endorserId: users[0].id, skill: 'AI' } }),
        prisma.skillEndorsement.create({ data: { mentorId: users[2].id, endorserId: users[5].id, skill: 'ML' } }),
        prisma.skillEndorsement.create({ data: { mentorId: users[2].id, endorserId: users[8].id, skill: 'Python' } }),
        prisma.skillEndorsement.create({ data: { mentorId: users[0].id, endorserId: users[5].id, skill: 'Web Dev' } }),
        prisma.skillEndorsement.create({ data: { mentorId: users[0].id, endorserId: users[2].id, skill: 'Python' } }),
    ]);
    console.log(`✅ Created test skill endorsements: ${endorsements.length}`);

    console.log('\n🎉 LinkUp v2.0 seeding complete!');
    console.log('Student Accounts:');
    console.log('- test_student@example.com / password123');
    users.forEach(u => console.log(`  👤 ${u.email} - ${u.name} (student)`));
    orgs.forEach(o => console.log(`  🏛️  ${o.email} - ${o.name} (organisation) ✅ verified`));
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
