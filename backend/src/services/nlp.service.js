/**
 * Simple NLP Service for Hazard Detection
 * Uses keyword matching to classify text as potential hazards.
 */

const HAZARD_KEYWORDS = [
    'debris', 'garbage', 'plastic', 'trash', 'waste',
    'oil', 'spill', 'slick', 'petroleum', 'tar',
    'sewage', 'pollution', 'dirty water', 'scum',
    'dead fish', 'wildlife', 'stranded', 'entangled'
];

const URGENCY_KEYWORDS = [
    'huge', 'massive', 'emergency', 'danger', 'toxic', 'immediate', 'help'
];

exports.analyzeText = (text) => {
    if (!text) return { is_hazard: false, confidence: 0, keywords: [] };

    const normalizedText = text.toLowerCase();
    const foundKeywords = [];
    let urgencyScore = 0;

    // Check for hazard keywords
    HAZARD_KEYWORDS.forEach(word => {
        if (normalizedText.includes(word)) {
            foundKeywords.push(word);
        }
    });

    // Check for urgency
    URGENCY_KEYWORDS.forEach(word => {
        if (normalizedText.includes(word)) {
            urgencyScore += 0.2;
        }
    });

    const is_hazard = foundKeywords.length > 0;

    // Calculate confidence: 
    // Base 0.5 if hazard found, +0.1 per extra keyword, + urgency score, capped at 1.0
    let confidence = 0;
    if (is_hazard) {
        confidence = 0.5 + ((foundKeywords.length - 1) * 0.1) + urgencyScore;
        confidence = Math.min(confidence, 0.95);
    }

    return {
        is_hazard,
        keywordsFound: foundKeywords,
        confidence: parseFloat(confidence.toFixed(2))
    };
};

/*
// Example Usage / Test:
console.log(exports.analyzeText("I see a massive oil spill near the coast with dead fish."));
// Output: { is_hazard: true, keywordsFound: ['oil', 'spill', 'dead fish'], confidence: 0.9 }
*/
