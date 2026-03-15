/**
 * Match Score Algorithm
 * calculateMatchScore(currentUser, otherUser, currentEventIds, otherEventIds)
 * Returns { score, reasons, sharedSkills, sharedInterests }
 */

function calculateMatchScore(currentUser, otherUser, currentEventIds = [], otherEventIds = []) {
    let score = 0;
    const reasons = [];

    // Skills overlap (20 pts each, max 60)
    const sharedSkills = (currentUser.skills || []).filter(s =>
        (otherUser.skills || []).includes(s)
    );
    const skillScore = Math.min(sharedSkills.length * 20, 60);
    score += skillScore;
    if (sharedSkills.length > 0) {
        reasons.push(`Both know ${sharedSkills.slice(0, 3).join(', ')}`);
    }

    // Interest overlap (15 pts each, max 45)
    const sharedInterests = (currentUser.interests || []).filter(i =>
        (otherUser.interests || []).includes(i)
    );
    const interestScore = Math.min(sharedInterests.length * 15, 45);
    score += interestScore;
    if (sharedInterests.length > 0) {
        reasons.push(`Both into ${sharedInterests.slice(0, 3).join(', ')}`);
    }

    // Same department (10 pts)
    if (currentUser.department && currentUser.department === otherUser.department) {
        score += 10;
        reasons.push('Same department');
    }

    // Same year (5 pts)
    if (currentUser.year && currentUser.year === otherUser.year) {
        score += 5;
        reasons.push('Same year');
    }

    // Both joined same events (10 pts per event, max 20)
    if (currentEventIds.length > 0 && otherEventIds.length > 0) {
        const sharedEvents = currentEventIds.filter(id => otherEventIds.includes(id));
        const eventScore = Math.min(sharedEvents.length * 10, 20);
        score += eventScore;
        if (sharedEvents.length > 0) {
            reasons.push(`${sharedEvents.length} shared event${sharedEvents.length > 1 ? 's' : ''}`);
        }
    }

    return {
        score: Math.min(score, 100),
        reasons,
        sharedSkills,
        sharedInterests,
    };
}

module.exports = { calculateMatchScore };
