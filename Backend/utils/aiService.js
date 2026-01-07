const groqGenerator = require('./groqGenerator');
const geminiGenerator = require('./geminiGenerator'); // Your existing Gemini setup

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'groq';
    console.log(`  Using AI provider: ${this.provider.toUpperCase()}`);
  }
  
  async generateQuestions(jobTitle, category, type, difficulty, count, numOptions) {
    let questions = [];
    let providerUsed = 'none';
    let error = null;
    
    // Try selected provider first
    if (this.provider === 'groq' && groqGenerator.isAvailable()) {
      try {
        console.log('🚀 Using Groq API...');
        questions = await groqGenerator.generateSimpleQuestions(
          jobTitle, category, type, difficulty, count, numOptions
        );
        providerUsed = 'groq';
      } catch (groqError) {
        console.error('  Groq failed:', groqError.message);
        error = groqError;
      }
    }
    
    // Fallback to Gemini if Groq fails
    if (questions.length === 0 && this.provider === 'gemini' && geminiGenerator.isAvailable()) {
      try {
        console.log('  Falling back to Gemini...');
        questions = await geminiGenerator.generateQuestions(
          jobTitle, category, type, difficulty, count, numOptions
        );
        providerUsed = 'gemini';
      } catch (geminiError) {
        console.error('  Gemini failed:', geminiError.message);
        error = geminiError;
      }
    }
    
    // Final fallback to internal generation
    if (questions.length === 0) {
      console.log('  Using internal fallback generation');
      questions = this.generateInternalFallback(
        jobTitle, category, type, difficulty, count, numOptions
      );
      providerUsed = 'fallback';
    }
    
    return {
      questions,
      provider: providerUsed,
      error: providerUsed === 'fallback' ? error : null
    };
  }
  
  generateInternalFallback(jobTitle, category, type, difficulty, count, numOptions) {
    // Your existing fallback logic
    const questions = [];
    const templates = {
      qcm_radio: [
        `What is the main advantage of using ${category} for ${jobTitle}?`,
        `Which ${category} concept is essential for ${jobTitle}?`,
        `What differentiates ${category} from similar technologies?`
      ],
      qcm_checkbox: [
        `Select all correct statements about ${category}:`,
        `Which of these are best practices for ${jobTitle} using ${category}?`
      ],
      code: [
        `Write a function that demonstrates ${category} usage for ${jobTitle}`,
        `Implement a solution using ${category} for a common ${jobTitle} task`
      ],
      libre: [
        `Explain how you would approach ${category} problems as a ${jobTitle}`,
        `Describe the architecture of a ${category}-based system for ${jobTitle}`
      ]
    };
    
    const templateList = templates[type] || templates['qcm_radio'];
    
    for (let i = 0; i < count; i++) {
      const template = templateList[i % templateList.length];
      const question = {
        text: template,
        type: type,
        difficulty: difficulty,
        jobTitle: jobTitle,
        category: category,
        time: difficulty === 'facile' ? 0.5 : difficulty === 'moyenne' ? 2 : 5,
        addedBy: 'AI (Internal)'
      };
      
      if (type === 'qcm_radio' || type === 'qcm_checkbox') {
        question.options = Array.from({ length: numOptions }, (_, idx) => {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          return `Option ${letters[idx]}`;
        });
        question.correctOptions = ['Option A'];
      }
      
      questions.push(question);
    }
    
    return questions;
  }
}

module.exports = new AIService();