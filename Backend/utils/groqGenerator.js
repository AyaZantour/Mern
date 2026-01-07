const Groq = require('groq-sdk');

class GroqQuestionGenerator {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.client = null;
    this.available = false;
    
    this.initialize();
  }
  
  initialize() {
    if (!this.apiKey) {
      console.log('⚠️ GROQ_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.client = new Groq({ apiKey: this.apiKey });
      this.available = true;
      console.log('✅ Groq API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Groq:', error.message);
      this.available = false;
    }
  }
  
  async generateQuestions(prompt) {
    if (!this.available || !this.client) {
      throw new Error('Groq API not available');
    }
    
    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a technical recruiter assistant. Generate technical interview questions in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'mixtral-8x7b-32768', // Fast and capable model
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });
      
      const response = chatCompletion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from Groq API');
      }
      
      return JSON.parse(response);
      
    } catch (error) {
      console.error('❌ Groq API error:', error.message);
      throw error;
    }
  }
  
  // Alternative method for simpler question generation
  async generateSimpleQuestions(jobTitle, category, type, difficulty, count, numOptions) {
    const prompt = this.buildPrompt(jobTitle, category, type, difficulty, count, numOptions);
    
    try {
      const response = await this.generateQuestions(prompt);
      return response.questions || [];
    } catch (error) {
      // Fallback to internal generation
      return this.generateFallbackQuestions(jobTitle, category, type, difficulty, count, numOptions);
    }
  }
  
  buildPrompt(jobTitle, category, type, difficulty, count, numOptions) {
    return `
Generate exactly ${count} technical interview questions with these specifications:

JOB TITLE: ${jobTitle}
CATEGORY: ${category}
QUESTION TYPE: ${type}
DIFFICULTY LEVEL: ${difficulty}

OUTPUT FORMAT: Return a JSON object with a "questions" array. Each question must have:
- "text": string (the question)
- "type": "${type}"
- "difficulty": "${difficulty}"
- "jobTitle": "${jobTitle}"
- "category": "${category}"
- "time": number (minutes: ${difficulty === 'facile' ? '0.5' : difficulty === 'moyenne' ? '2' : '5'})
- "addedBy": "AI"

ADDITIONAL FIELDS BASED ON TYPE:
${type === 'qcm_radio' || type === 'qcm_checkbox' ? `- "options": array of ${numOptions} strings
- "correctOptions": array of correct answers (1 for radio, 1-${numOptions-1} for checkbox)` : ''}
${type === 'code' ? `- "starterCode": string (initial code snippet)
- "language": string (javascript, python, etc.)
- "correctOptions": array with expected solution` : ''}
${type === 'libre' ? `- "correctOptions": array with example answer` : ''}

RULES:
1. Questions must be realistic and relevant to ${jobTitle} position
2. ${difficulty} difficulty means ${difficulty === 'facile' ? 'basic concepts' : difficulty === 'moyenne' ? 'intermediate level' : 'advanced/expert level'}
3. For QCM: Make distractors plausible but incorrect
4. For coding: Include relevant ${category} concepts
5. For open-ended: Focus on practical scenarios

Return ONLY valid JSON, no additional text.
    `;
  }
  
  generateFallbackQuestions(jobTitle, category, type, difficulty, count, numOptions) {
    const questions = [];
    const difficultyTimes = {
      'facile': 0.5, 'easy': 0.5,
      'moyenne': 2, 'medium': 2,
      'difficile': 5, 'hard': 5
    };
    
    for (let i = 0; i < count; i++) {
      const question = {
        text: `[Groq Fallback] ${difficulty} question ${i+1} about ${category} for ${jobTitle}`,
        type: type,
        difficulty: difficulty,
        jobTitle: jobTitle,
        category: category,
        time: difficultyTimes[difficulty] || 2,
        addedBy: 'AI (Fallback)'
      };
      
      if (type === 'qcm_radio' || type === 'qcm_checkbox') {
        question.options = Array.from({ length: numOptions }, (_, idx) => 
          `Choice ${String.fromCharCode(65 + idx)}`
        );
        question.correctOptions = type === 'qcm_radio' ? ['Choice A'] : ['Choice A', 'Choice B'];
      } else if (type === 'code') {
        question.starterCode = `// ${category} solution for ${jobTitle}\n// Difficulty: ${difficulty}\n\nfunction solution() {\n  // Implement your solution here\n}`;
        question.language = 'javascript';
        question.correctOptions = ['Expected solution implementation'];
      } else {
        question.correctOptions = [`Comprehensive answer covering ${category} concepts for ${jobTitle}`];
      }
      
      questions.push(question);
    }
    
    return questions;
  }
  
  isAvailable() {
    return this.available;
  }
}

// Singleton instance
const groqGenerator = new GroqQuestionGenerator();
module.exports = groqGenerator;