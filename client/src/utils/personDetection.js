// src/utils/personDetection.js

/**
 * Advanced person detection utilities for news content
 */

// Common titles and prefixes that indicate names
const NAME_PREFIXES = [
  'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor', 'sir', 'lady', 'lord',
  'president', 'prime minister', 'pm', 'senator', 'rep', 'governor', 'mayor',
  'ceo', 'cto', 'cfo', 'director', 'manager', 'coach', 'captain', 'judge'
];

// Words that are likely NOT names
const EXCLUDE_WORDS = [
  'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'news', 'today', 'yesterday', 'tomorrow', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'march',
  'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november',
  'december', 'said', 'says', 'told', 'according', 'reported', 'sources'
];

// Location indicators that are NOT names
const LOCATION_INDICATORS = [
  'city', 'state', 'country', 'street', 'avenue', 'road', 'district', 'county',
  'province', 'region', 'area', 'zone', 'department', 'ministry', 'office'
];

/**
 * Extract potential person names from text content
 * @param {string} content - The text content to analyze
 * @param {Array} existingPeople - Array of existing people to match against
 * @returns {Array} Array of potential person matches
 */
export const detectPeopleInContent = (content, existingPeople = []) => {
  if (!content || content.length < 50) {
    return [];
  }

  // Clean and prepare the content
  const cleanContent = content
    .replace(/[""'']/g, '"') // Normalize quotes
    .replace(/[–—]/g, '-') // Normalize dashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const potentialNames = extractPotentialNames(cleanContent);
  const matches = matchWithExistingPeople(potentialNames, existingPeople);
  
  return matches;
};

/**
 * Extract potential names using multiple strategies
 * @param {string} content - Clean text content
 * @returns {Array} Array of potential name strings
 */
const extractPotentialNames = (content) => {
  const potentialNames = new Set();
  
  // Strategy 1: Look for quoted names
  const quotedNames = extractQuotedNames(content);
  quotedNames.forEach(name => potentialNames.add(name));
  
  // Strategy 2: Look for capitalized word patterns
  const capitalizedNames = extractCapitalizedNames(content);
  capitalizedNames.forEach(name => potentialNames.add(name));
  
  // Strategy 3: Look for names with titles/prefixes
  const titledNames = extractTitledNames(content);
  titledNames.forEach(name => potentialNames.add(name));
  
  // Strategy 4: Look for names in specific contexts
  const contextualNames = extractContextualNames(content);
  contextualNames.forEach(name => potentialNames.add(name));
  
  return Array.from(potentialNames).filter(name => isValidName(name));
};

/**
 * Extract names from quoted text
 * @param {string} content 
 * @returns {Array}
 */
const extractQuotedNames = (content) => {
  const names = [];
  
  // Pattern: "quote," said Name or "quote," Name said
  const quoteSaidPattern = /"[^"]+",?\s+(?:said\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)|([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+said/g;
  let match;
  
  while ((match = quoteSaidPattern.exec(content)) !== null) {
    const name = match[1] || match[2];
    if (name && !EXCLUDE_WORDS.includes(name.toLowerCase())) {
      names.push(name.trim());
    }
  }
  
  return names;
};

/**
 * Extract names based on capitalization patterns
 * @param {string} content 
 * @returns {Array}
 */
const extractCapitalizedNames = (content) => {
  const names = [];
  const words = content.split(/\s+/);
  
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = cleanWord(words[i]);
    const word2 = cleanWord(words[i + 1]);
    
    // Check for two consecutive capitalized words
    if (isCapitalized(word1) && isCapitalized(word2) && 
        word1.length > 1 && word2.length > 1 &&
        !EXCLUDE_WORDS.includes(word1.toLowerCase()) &&
        !EXCLUDE_WORDS.includes(word2.toLowerCase()) &&
        !LOCATION_INDICATORS.includes(word1.toLowerCase()) &&
        !LOCATION_INDICATORS.includes(word2.toLowerCase())) {
      
      // Check for three-word names
      if (i < words.length - 2) {
        const word3 = cleanWord(words[i + 2]);
        if (isCapitalized(word3) && word3.length > 1 && 
            !EXCLUDE_WORDS.includes(word3.toLowerCase())) {
          names.push(`${word1} ${word2} ${word3}`);
          continue;
        }
      }
      
      names.push(`${word1} ${word2}`);
    }
  }
  
  return names;
};

/**
 * Extract names with titles or prefixes
 * @param {string} content 
 * @returns {Array}
 */
const extractTitledNames = (content) => {
  const names = [];
  
  NAME_PREFIXES.forEach(prefix => {
    // Pattern: Title Name or Title. Name
    const pattern = new RegExp(`\\b${prefix}\\.?\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'gi');
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      if (name && !EXCLUDE_WORDS.includes(name.toLowerCase())) {
        names.push(name.trim());
      }
    }
  });
  
  return names;
};

/**
 * Extract names from specific contexts
 * @param {string} content 
 * @returns {Array}
 */
const extractContextualNames = (content) => {
  const names = [];
  
  // Pattern: according to Name, Name told reporters, Name announced
  const contextPatterns = [
    /according\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:told|said|announced|stated|declared|confirmed)/gi,
    /(?:by|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
  ];
  
  contextPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      if (name && !EXCLUDE_WORDS.includes(name.toLowerCase())) {
        names.push(name.trim());
      }
    }
  });
  
  return names;
};

/**
 * Match potential names with existing people
 * @param {Array} potentialNames 
 * @param {Array} existingPeople 
 * @returns {Array}
 */
const matchWithExistingPeople = (potentialNames, existingPeople) => {
  const matches = [];
  
  potentialNames.forEach(potentialName => {
    const match = existingPeople.find(person => {
      const personName = person.name.toLowerCase();
      const potential = potentialName.toLowerCase();
      
      // Exact match
      if (personName === potential) return true;
      
      // Partial match (first name + last name)
      const personParts = personName.split(' ');
      const potentialParts = potential.split(' ');
      
      if (personParts.length >= 2 && potentialParts.length >= 2) {
        const personFirst = personParts[0];
        const personLast = personParts[personParts.length - 1];
        const potentialFirst = potentialParts[0];
        const potentialLast = potentialParts[potentialParts.length - 1];
        
        if (personFirst === potentialFirst && personLast === potentialLast) {
          return true;
        }
      }
      
      // Check if potential name is contained in person name or vice versa
      if (personName.includes(potential) || potential.includes(personName)) {
        return true;
      }
      
      return false;
    });
    
    if (match && !matches.find(m => m.id === match.id)) {
      matches.push({
        ...match,
        detectedAs: potentialName,
        confidence: calculateConfidence(potentialName, match.name)
      });
    }
  });
  
  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Calculate confidence score for name match
 * @param {string} detected 
 * @param {string} actual 
 * @returns {number}
 */
const calculateConfidence = (detected, actual) => {
  const detectedLower = detected.toLowerCase();
  const actualLower = actual.toLowerCase();
  
  // Exact match
  if (detectedLower === actualLower) return 1.0;
  
  // Calculate similarity based on word overlap
  const detectedWords = detectedLower.split(' ');
  const actualWords = actualLower.split(' ');
  
  let matchingWords = 0;
  detectedWords.forEach(word => {
    if (actualWords.includes(word)) {
      matchingWords++;
    }
  });
  
  const maxWords = Math.max(detectedWords.length, actualWords.length);
  return matchingWords / maxWords;
};

/**
 * Utility functions
 */
const cleanWord = (word) => {
  return word.replace(/[^\w]/g, '');
};

const isCapitalized = (word) => {
  return word.length > 0 && word[0] === word[0].toUpperCase();
};

const isValidName = (name) => {
  if (!name || name.length < 2) return false;
  
  const words = name.split(' ');
  if (words.length < 2 || words.length > 4) return false;
  
  // Check if all words are capitalized
  return words.every(word => isCapitalized(word) && word.length > 1);
};

/**
 * Enhanced detection with machine learning-like scoring
 * @param {string} content 
 * @param {Array} existingPeople 
 * @returns {Array}
 */
export const detectPeopleWithScoring = (content, existingPeople = []) => {
  const basicDetection = detectPeopleInContent(content, existingPeople);
  
  // Add contextual scoring
  return basicDetection.map(match => {
    let score = match.confidence;
    
    // Boost score if person has high news count (more likely to be mentioned)
    if (match.newsCount > 10) score += 0.1;
    if (match.newsCount > 50) score += 0.1;
    
    // Boost score if person is in politics/celebrity categories
    if (['politician', 'celebrity'].includes(match.category)) {
      score += 0.1;
    }
    
    // Boost score if detected multiple times in content
    const detectionCount = (content.toLowerCase().match(new RegExp(match.name.toLowerCase(), 'g')) || []).length;
    if (detectionCount > 1) {
      score += Math.min(detectionCount * 0.05, 0.2);
    }
    
    return {
      ...match,
      finalScore: Math.min(score, 1.0)
    };
  }).sort((a, b) => b.finalScore - a.finalScore);
};

/**
 * Quick name detection for real-time suggestions
 * @param {string} content 
 * @param {Array} existingPeople 
 * @returns {Array}
 */
export const quickDetectPeople = (content, existingPeople = []) => {
  if (!content || content.length < 20) return [];
  
  const matches = [];
  const contentLower = content.toLowerCase();
  
  existingPeople.forEach(person => {
    const personName = person.name.toLowerCase();
    
    // Simple inclusion check
    if (contentLower.includes(personName)) {
      matches.push({
        ...person,
        confidence: 0.8
      });
    } else {
      // Check for partial matches (first name or last name)
      const nameParts = personName.split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        if (contentLower.includes(firstName) && contentLower.includes(lastName)) {
          matches.push({
            ...person,
            confidence: 0.6
          });
        }
      }
    }
  });
  
  return matches.slice(0, 5); // Limit to top 5 for performance
};