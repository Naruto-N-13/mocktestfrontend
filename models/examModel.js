const db = require('../config/db');

const ExamModel = {
  // Clear old temporary records registry tracking database grid profiles data rows context nodes
  clearGeneratedQuestions: async () => {
    return await db.query('TRUNCATE TABLE pdf_generated_questions');
  },

  // Batch insert optimization schema layout records parameters values mappings setup rows insertion data block
  insertGeneratedQuestion: async (questionText, optA, optB, optC, optD, correctOption) => {
    const sqlQuery = `INSERT INTO pdf_generated_questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)`;
    const valuesArray = [questionText, optA, optB, optC, optD, correctOption];
    return await db.query(sqlQuery, valuesArray);
  },

  // Non-deterministic random arrays row layout ordering dataset fetch operation data mapping sequence trace 
  fetchRandomizedQuestions: async () => {
    const sqlQuery = 'SELECT id, question_text, option_a, option_b, option_c, option_d FROM pdf_generated_questions ORDER BY RAND()';
    const [rows] = await db.query(sqlQuery);
    return rows;
  }
};

module.exports = ExamModel;
