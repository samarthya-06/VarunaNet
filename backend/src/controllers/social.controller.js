const nlpService = require('../services/nlp.service');

// Mock data source - Indian coastal locations
const MOCK_TWEETS = [
    "Huge amount of plastic debris washed up on Juhu Beach this morning. #pollution #Mumbai",
    "Beautiful sunset at Marine Drive! No garbage in sight today.",
    "Urgent: Dead turtle found near Versova Beach. Experts needed. #Wildlife",
    "Water looking weirdly green and oily near Mumbai Port. Smell is terrible.",
    "Family picnic at Goa beach. Sand is clean, great work by cleaners!",
    "Massive oil slick spotted by fishermen near Chennai coast.",
    "Just saw a dolphin entangled in a fishing net near Gateway of India! Trying to help."
];

exports.getFeed = async (req, res) => {
    // Generate 'live' feed by processing mock tweets
    const feed = MOCK_TWEETS.map((text, idx) => {
        const analysis = nlpService.analyzeText(text);
        return {
            id: `social-${idx}`,
            platform: 'twitter',
            user: `User_${Math.floor(Math.random() * 1000)}`,
            text,
            analysis, // Nesting it to match frontend expectation
            timestamp: new Date(Date.now() - idx * 3600000).toISOString() // staggered times
        };
    });

    // Sort by confidence/urgency
    feed.sort((a, b) => b.analysis.confidence - a.analysis.confidence);

    res.json({
        status: 'success',
        data: feed
    });
};
