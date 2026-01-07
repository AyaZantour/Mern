function parseGeminiResponse(text) {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
      console.warn(' No JSON array found in response');
      return [];
    }
    
    const jsonStr = cleaned.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed)) {
      console.warn(' Parsed content is not an array');
      return [];
    }
    
    return parsed;
  } catch (err) {
    console.error(' Failed to parse Gemini JSON:', err);
    return [];
  }
}

module.exports = { parseGeminiResponse };