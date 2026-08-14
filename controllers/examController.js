// =========================================================================================================
// 1. CRITICAL POLYFILL INTERCEPTOR: Bypasses legacy window environment check failures in Node.js
// =========================================================================================================
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}

// =========================================================================================================
// 2. CORE ENGINES DEPENDENCY REGISTER: (Standard CommonJS Imports Target Architecture Modules)
// =========================================================================================================
const { PdfReader } = require('pdfreader'); 
const ExamModel = require('../models/examModel');
const db = require('../config/db');

// Private helper: Super accurate line pattern extractor metrics 
function parseTextToQuestions(rawText) {
  // Strip special empty white structures completely before sequence parsing loop orchestration 
  const cleanLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questionsDraft = [];
  
  let tempQ = "";
  let tempOpts = [];
  let tempCorrectAnsContentStr = ""; 

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];
    
    // Exact standard matching headers markers validation identifiers (Supports Q1, Q2, 1., 20. pattern markers)
    if (line.toLowerCase().startsWith('q:') || line.match(/^\d+\./) || line.toLowerCase().startsWith('q1') || line.toLowerCase().startsWith('q2') || line.match(/^q\d+/i)) {
      
      // =========================================================================
      // DYNAMIC TAIL FILTER INTERCEPTOR: Checks if string content length criteria parameters are safely validated
      // =========================================================================
      if (tempQ && tempQ.trim().length > 3) {
        // Pad missing array labels securely if optional text lines configuration drop
        while (tempOpts.length < 4) {
          tempOpts.push(`Option Placeholder Data Reference Matrix Block`);
        }
        questionsDraft.push({ text: tempQ, options: tempOpts.slice(0, 4), masterCorrectKey: tempCorrectAnsContentStr });
      }
      tempQ = line;
      tempOpts = [];
      tempCorrectAnsContentStr = "";
    } 
    // Option characters strings layout mapping stripping indicators (Supports A), B), C:, D. choices tags)
    else if (line.match(/^[A-D]\)/) || line.match(/^[A-D]\./) || line.match(/^[A-D]:/)) {
      const cleanOptionValueStr = line.replace(/^[A-D][\)\.\:]\s*/i, "").trim();
      tempOpts.push(cleanOptionValueStr);
    } 
    // Captures absolute exact answer keys index identifiers or literal text strings values
    else if (line.toUpperCase().startsWith('ANS:') || line.toUpperCase().startsWith('ANSWER:')) {
      const colonIndexKeyOffset = line.indexOf(':');
      if (colonIndexKeyOffset !== -1) {
        const isolatedRawAnsPayload = line.substring(colonIndexKeyOffset + 1).replace(/\s+/g, ' ').trim();
        
        if (isolatedRawAnsPayload.length === 1 && ['A','B','C','D'].includes(isolatedRawAnsPayload.toUpperCase())) {
          const charCodeLabel = isolatedRawAnsPayload.toUpperCase();
          const targetOffsetIndex = charCodeLabel.charCodeAt(0) - 65;
          tempCorrectAnsContentStr = tempOpts[targetOffsetIndex] || charCodeLabel;
        } else {
          tempCorrectAnsContentStr = isolatedRawAnsPayload;
        }
      }
    } 
    else if (tempQ && tempOpts.length === 0) {
      tempQ += " " + line;
    }
  }
  

  // CRITICAL PROTECTION TAIL FIX: Checks string token context rules parameters matching exactly before insertion pipeline tracking
  if (tempQ && tempQ.trim().length > 3 && tempOpts.length > 0) {
    while (tempOpts.length < 4) {
      tempOpts.push(`Option Placeholder Data Reference Matrix Block`);
    }
    questionsDraft.push({ text: tempQ, options: tempOpts.slice(0, 4), masterCorrectKey: tempCorrectAnsContentStr });
  }

  return questionsDraft;
}

const ExamController = {
  uploadAndProcessPdf: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'File payload is missing.' });

      console.log("Analyzing file block buffer data payload stream: ", req.file.originalname);
      let accumulatedRawText = "";
      
      await new Promise((resolve, reject) => {
        new PdfReader().parseBuffer(req.file.buffer, (err, item) => {
          if (err) return reject(err);
          if (!item) return resolve();
          if (item.text) accumulatedRawText += item.text + "\n";
        });
      });

      const parsedQuestions = parseTextToQuestions(accumulatedRawText);
      console.log(`Diagnostics tracking logs - Total extracted questions array length: ${parsedQuestions.length}`);
      
      await ExamModel.clearGeneratedQuestions();
      await db.query('TRUNCATE TABLE student_exam_responses'); 

      for (const rawQ of parsedQuestions) {
        const cleanQuestionText = rawQ.text.replace(/\s+/g, ' ').trim();
        const cleanOptA = rawQ.options[0].replace(/\s+/g, ' ').trim();
        const cleanOptB = rawQ.options[1].replace(/\s+/g, ' ').trim();
        const cleanOptC = rawQ.options[2].replace(/\s+/g, ' ').trim();
        const cleanOptD = rawQ.options[3].replace(/\s+/g, ' ').trim();
        
        let cleanMasterCorrectKey = rawQ.masterCorrectKey ? rawQ.masterCorrectKey.replace(/\s+/g, ' ').trim() : cleanOptA;
        if (cleanMasterCorrectKey === "A" || cleanMasterCorrectKey === "B" || cleanMasterCorrectKey === "C" || cleanMasterCorrectKey === "D") {
          const indexOffset = cleanMasterCorrectKey.charCodeAt(0) - 65;
          cleanMasterCorrectKey = rawQ.options[indexOffset] || cleanMasterCorrectKey;
        }

        console.log(`[Database Inserter Worker Node] Inserting -> Q: ${cleanQuestionText} | Correct Answer: ${cleanMasterCorrectKey}`);

        await db.query(
          'INSERT INTO pdf_generated_questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)',
          [cleanQuestionText, cleanOptA, cleanOptB, cleanOptC, cleanOptD, cleanMasterCorrectKey]
        );
      }

      return res.status(200).json({ 
        success: true, 
        message: 'PDF structured text extraction processing complete. All items mapped successfully.',
        count: parsedQuestions.length 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add this precise authentication handler method block inside your existing ExamController object model keys context:



  getRandomizedQuestionsList: async (req, res) => {
    try {
      const [dataRows] = await db.query('SELECT * FROM pdf_generated_questions ORDER BY RAND()');
      res.status(200).json({ success: true, count: dataRows.length, data: dataRows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  authenticatePortalUserCredentials: async (req, res) => {
    try {
      const { login_id, password } = req.body;

      if (!login_id || !password) {
        return res.status(400).json({ success: false, message: 'Missing Login ID or Password input streams.' });
      }

      // Query database repository records matching unique login string keys identifier tags references
      const sqlVerifyQuery = 'SELECT login_id, password_hash, user_role FROM portal_user_accounts WHERE login_id = ?';
      const [userRows] = await db.query(sqlVerifyQuery, [login_id.trim()]);

      if (userRows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid Username or Login ID identity not found.' });
      }

      const activeMatchedUserAccountNode = userRows[0];

      // Exact text structural normalization validation matching direct passwords tokens values check bounds rules
      if (password === activeMatchedUserAccountNode.password_hash) {
        console.log(`[Authentication System Success] User logged in: ${activeMatchedUserAccountNode.login_id} | Role: ${activeMatchedUserAccountNode.user_role}`);
        
        return res.status(200).json({
          success: true,
          message: 'Secure portal user credentials verification success.',
          profileSessionPayload: {
            userTokenId: activeMatchedUserAccountNode.login_id,
            userAssignedRole: activeMatchedUserAccountNode.user_role
          }
        });
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect Password credential parameter matches.' });
      }

    } catch (error) {
      console.error("Authentication framework exception trace error logged: ", error);
      res.status(500).json({ success: false, message: 'Internal authentication provider runtime failure.', error: error.message });
    }
  },

  clearPortalActiveQuestionRepositoryData: async (req, res) => {
    try {
      console.log("[Wipe Clean Request Intercepted] Truncating database active question caches grid matrices...");
      
      // 1. Clear raw question sets database table sequences parameters
      await db.query('TRUNCATE TABLE pdf_generated_questions');
      
      // 2. Clear user session selections records history repository metrics
      await db.query('TRUNCATE TABLE student_exam_responses');

      res.status(200).json({ 
        success: true, 
        message: 'Active portal storage tables cleared down securely with zero persistent data leaks.' 
      });
    } catch (error) {
      console.error("Wipe cleanup handler context intercept runtime exception error logs: ", error);
      res.status(500).json({ success: false, message: 'Internal tables grid flush routine failed.', error: error.message });
    }
  },

  evaluateUserExamScorecard: async (req, res) => {
    try {
      const { submitted_answers } = req.body; 
      if (!submitted_answers || !Array.isArray(submitted_answers)) {
        return res.status(400).json({ success: false, message: 'Invalid payload.' });
      }

      await db.query('TRUNCATE TABLE student_exam_responses');
      for (const ans of submitted_answers) {
        if (ans.chosen_option && ans.chosen_option.trim() !== '') {
          const cleanUserSelectedOptionStr = ans.chosen_option.replace(/\s+/g, ' ').trim();
          await db.query('INSERT INTO student_exam_responses (question_id, selected_option_text) VALUES (?, ?)', [ans.question_id, cleanUserSelectedOptionStr]);
        }
      }

      const [actualAnswerKeys] = await db.query('SELECT id, correct_option FROM pdf_generated_questions');
      let correctTrackerCount = 0; let wrongTrackerCount = 0; let netFinalScore = 0.00;
      const reviewQuestionsPreviewReportList = [];

      const studentInputsMap = {};
      submitted_answers.forEach(row => { 
        studentInputsMap[row.question_id] = row.chosen_option ? row.chosen_option.replace(/\s+/g, ' ').trim() : ''; 
      });

      actualAnswerKeys.forEach(row => {
        const chosenText = studentInputsMap[row.id] || '';
        const targetDbMasterCorrectKeyString = row.correct_option ? row.correct_option.replace(/\s+/g, ' ').trim() : '';
        const isCorrectCheck = (chosenText !== '' && chosenText.toLowerCase() === targetDbMasterCorrectKeyString.toLowerCase());

        if (chosenText !== '') {
          if (isCorrectCheck) { correctTrackerCount++; netFinalScore += 1.00; }
          else { wrongTrackerCount++; netFinalScore -= 0.33; }
        }

        reviewQuestionsPreviewReportList.push({
          question_id: row.id,
          correct_db_option_text: row.correct_option,
          student_chosen_option_text: studentInputsMap[row.id] || '',
          status_is_correct: isCorrectCheck
        });
      });

      const totalAnswered = correctTrackerCount + wrongTrackerCount;
      const accuracyPercentage = totalAnswered > 0 ? parseFloat(((correctTrackerCount / totalAnswered) * 100).toFixed(2)) : 0.00;

      res.status(200).json({
        success: true,
        evaluationSummaryMetrics: {
          totalExamQuestionsCount: actualAnswerKeys.length,
          correctAnswersCountChecked: correctTrackerCount,
          wrongAnswersCountChecked: wrongTrackerCount,
          finalTotalNetScoreCalculated: parseFloat(netFinalScore.toFixed(2)),
          accuracyPercentageCalculated: accuracyPercentage
        },
        previewSheetDataset: reviewQuestionsPreviewReportList 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  
};


module.exports = ExamController;
