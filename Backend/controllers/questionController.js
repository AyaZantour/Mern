const Question = require('../models/Question.js');
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//current Groq model
const GROQ_MODEL = "llama-3.3-70b-versatile"; 

const extractJSON = (text) => {
  try {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end));
  } catch (e) {
    return null;
  }
};

const createQuestion = async (req, res) => {
  try {
    const payload = req.body || {};
    payload.time = (() => {
      const t = parseFloat(payload.time);
      return isNaN(t) ? 1 : t;
    })();

    const q = await Question.create(payload);
    return res.status(201).json({ success: true, data: q });
  } catch (err) {
    console.error('createQuestion error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la création de la question.' 
    });
  }
};

const generateQuestions = async (req, res) => {
  console.log(" /api/questions/generate HIT");
  console.log(" Incoming body:", req.body);
  
  const {
    type,
    jobTitle,
    category,
    numOptions = 4,
    facile,
    moyenne,
    difficile,
  } = req.body;

  if (!type || !jobTitle || !category) {
    return res.status(400).json({
      success: false,
      error: 'Type, jobTitle, and category are required fields'
    });
  }

  const difficultyMap = {
    ...(facile ? { facile } : {}),
    ...(moyenne ? { moyenne } : {}),
    ...(difficile ? { difficile } : {}),
  };

  try {
    let allQuestions = [];

    for (const [difficulty, count] of Object.entries(difficultyMap)) {
      const existingQuestions = await Question.find({ 
        type, 
        difficulty, 
        jobTitle 
      }).limit(count);

      allQuestions = [...allQuestions, ...existingQuestions];

      const remaining = count - existingQuestions.length;
      if (remaining <= 0) continue;

      const prompt = `
Tu es un assistant de recrutement. Génère ${remaining} questions pour le poste "${jobTitle}", de type "${type}" et de difficulté "${difficulty}", dans la catégorie "${category}".

Règles strictes :
- Chaque question doit contenir :
  - "text": libellé clair
  - "type": "${type}"
  - "difficulty": "${difficulty}"
  - "jobTitle": "${jobTitle}"
  - "category": "${category}"
  - "addedBy": "AI"
  - "time": estimation réaliste :
      - facile → 0.5
      - moyenne → entre 1 et 2
      - difficile → entre 3 et 6

- Si type = qcm_radio ou qcm_checkbox :
  - "options": tableau de ${numOptions} réponses
  - "correctOptions": réponses correctes

- Si type = code :
  - "starterCode": base de code
  - "language": ex: JavaScript, Python, etc.
  - "correctOptions": réponse attendue

- Si type = libre :
  - "correctOptions": exemple de réponse correcte

Retourne un tableau JSON propre sans commentaires ni texte inutile.
`.trim();

      try {
        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL, 
          temperature: 0.4,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const text = completion.choices[0]?.message?.content || '';
        const parsedQuestions = extractJSON(text);

        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          console.warn(`⚠️ Groq n'a rien renvoyé pour ${difficulty}`);
          continue;
        }

        const questionsToSave = parsedQuestions.map((question) => ({
          ...question,
          type,
          jobTitle,
          category,
          difficulty,
          addedBy: 'AI',
          validated: true,
          createdAt: new Date(),
        }));

        const savedQuestions = await Question.insertMany(questionsToSave);
        allQuestions = [...allQuestions, ...savedQuestions];
      } catch (groqError) {
        console.error(`❌ Groq error for ${difficulty}:`, groqError.message);
        // Continue to next difficulty instead of failing completely
      }
    }

    res.json({
      success: true,
      count: allQuestions.length,
      data: allQuestions
    });
  } catch (error) {
    console.error('❌ Error in generateQuestions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des questions.'
    });
  }
};

const refreshQuestion = async (req, res) => {
  console.log("🔄 /api/questions/refresh HIT");
  console.log("📩 Incoming body:", req.body);
  
  const { type, difficulty, jobTitle, category, numOptions = 4 } = req.body;

  if (!type || !difficulty || !jobTitle || !category) {
    return res.status(400).json({
      success: false,
      error: 'Type, difficulty, jobTitle, and category are required fields'
    });
  }

  try {
    const prompt = `
Génère 1 question pour le poste "${jobTitle}", de type "${type}" et difficulté "${difficulty}" dans la catégorie "${category}".
- Retourne un tableau JSON d'un seul objet avec :
  - "text", "type", "difficulty", "jobTitle", "category", "addedBy", "time"
  - Pour QCM : "options" (${numOptions} réponses), "correctOptions"
  - Pour code : "starterCode", "language", "correctOptions"
  - Pour libre : "correctOptions"
  - "addedBy": "AI"
  - "validated": true
  - "createdAt": Date du jour
`.trim();

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || '';
    const parsedQuestions = extractJSON(text);

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Aucune question générée par Groq.'
      });
    }

    const [question] = parsedQuestions;

    let fixedTime = parseFloat(question.time);
    if (isNaN(fixedTime) || fixedTime <= 0 || fixedTime > 10) {
      if (difficulty === 'facile') fixedTime = 0.5;
      else if (difficulty === 'moyenne') fixedTime = 2;
      else fixedTime = 5;
    }

    const savedQuestion = await Question.create({
      ...question,
      type,
      difficulty,
      jobTitle,
      category,
      time: fixedTime,
      addedBy: 'AI',
      validated: true,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      data: savedQuestion
    });
  } catch (error) {
    console.error(' Error in refreshQuestion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rafraîchissement de la question.'
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error(' Error in getQuestions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des questions.'
    });
  }
};

module.exports = {
  generateQuestions,
  refreshQuestion,
  getQuestions,
  createQuestion
};