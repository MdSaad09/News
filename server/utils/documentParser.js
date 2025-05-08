// utils/documentParser.js
const mammoth = require('mammoth'); // For docx parsing
const fs = require('fs');
const path = require('path');

/**
 * Parse content from various file formats
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileType - File extension (txt, doc, docx)
 */
const parseDocumentContent = async (filePath, fileType) => {
  try {
    if (fileType === 'txt') {
      // Read and parse text file
      const content = fs.readFileSync(filePath, 'utf8');
      return parseFormattedTextContent(content);
    } else if (fileType === 'docx') {
      // Parse docx using mammoth
      const result = await mammoth.extractRawText({ path: filePath });
      return parseFormattedTextContent(result.value);
    } else if (fileType === 'doc') {
      // For doc files, we'd need a different approach
      // This is a placeholder - you might want to use a different library
      throw new Error('DOC format not yet supported');
    }
    
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Document parsing error:', error);
    throw error;
  }
};

/**
 * Parse formatted text content into news articles
 * Supports multiple formats:
 * 1. NEWSH/NEWSD format as in your current implementation
 * 2. Markdown-style format
 * 3. Simple title + content format with blank lines as separators
 */
const parseFormattedTextContent = (content) => {
  // Check if content uses the NEWSH format
  if (content.includes('NEWSH:')) {
    return parseStructuredFormat(content);
  }
  
  // Otherwise try to parse as simple articles separated by multiple newlines
  return parseSimpleFormat(content);
};

/**
 * Parse NEWSH/NEWSD structured format
 */
const parseStructuredFormat = (content) => {
  const lines = content.split('\n');
  const articles = [];
  let currentArticle = {};
  
  for (let line of lines) {
    line = line.trim();
    
    if (line.startsWith('NEWSH:')) {
      // If we already have a current article with a title, save it and start a new one
      if (currentArticle.title) {
        articles.push(currentArticle);
        currentArticle = {};
      }
      currentArticle.title = line.substring(6).trim();
    } else if (line.startsWith('NEWSD:')) {
      currentArticle.content = line.substring(6).trim();
    } else if (line.startsWith('NEWSS:')) {
      currentArticle.summary = line.substring(6).trim();
    } else if (line.startsWith('NEWSIMG:')) {
      currentArticle.coverImage = line.substring(8).trim();
    } else if (line.startsWith('CATEGORY:')) {
      currentArticle.category = line.substring(9).trim();
    } else if (line.startsWith('TAGS:')) {
      currentArticle.tags = line.substring(5).trim().split(',').map(tag => tag.trim());
    } else if (currentArticle.content && line) {
      // Append to content if we're already in a content section
      currentArticle.content += '\n' + line;
    }
  }
  
  // Add the last article if it has a title
  if (currentArticle.title) {
    articles.push(currentArticle);
  }
  
  return articles;
};

/**
 * Parse simple format (titles separated by blank lines)
 */
const parseSimpleFormat = (content) => {
  // Split on multiple newlines
  const sections = content.split(/\n{2,}/);
  const articles = [];
  
  for (let section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    if (lines.length === 0) continue;
    
    // First line is the title, rest is content
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    if (title && content) {
      articles.push({
        title,
        content,
        summary: content.substring(0, Math.min(150, content.length)) + '...',
        category: 'other' // Default category
      });
    }
  }
  
  return articles;
};

module.exports = {
  parseDocumentContent
};