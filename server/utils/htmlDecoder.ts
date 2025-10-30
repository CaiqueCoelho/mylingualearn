/**
 * Comprehensive HTML entity decoder
 * Handles all common HTML entities including numeric ones
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  // First pass: decode common named entities
  const namedEntities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&bull;': '•',
    '&middot;': '·',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
  };
  
  let decoded = text;
  
  // Replace named entities (case insensitive) - multiple passes to catch all
  for (let i = 0; i < 3; i++) {
    for (const [entity, char] of Object.entries(namedEntities)) {
      const regex = new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      decoded = decoded.replace(regex, char);
    }
  }
  
  // Decode numeric entities (&#123; or &#xAB;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Remove any remaining unrecognized entities (multiple passes)
  for (let i = 0; i < 3; i++) {
    decoded = decoded.replace(/&[a-zA-Z0-9#]+;/g, ' ');
    decoded = decoded.replace(/&nbsp;?/gi, ' ');
  }
  
  // Remove zero-width characters
  decoded = decoded.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Normalize whitespace
  decoded = decoded.replace(/\s+/g, ' ').trim();
  
  return decoded;
}

/**
 * Clean HTML tags and decode entities
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return '';
  
  let cleaned = html;
  
  // Remove script and style tags with their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned);
  
  return cleaned;
}

