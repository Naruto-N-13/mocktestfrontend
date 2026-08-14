// const express = require('express');
// const multer = require('multer');
// const ExamController = require('../controllers/examController');

// const router = express.Router();
// const uploadMemoryStorage = multer({ storage: multer.memoryStorage() });

// // Route maps configuration tracking pointer endpoints controllers reference points execution allocation blocks
// router.post('/upload-pdf', uploadMemoryStorage.single('exam_pdf_file'), ExamController.uploadAndProcessPdf);
// router.get('/pdf-questions/random', ExamController.getRandomizedQuestionsList);
// router.post('/evaluate-scorecard', ExamController.evaluateUserExamScorecard);
// router.post('/save-option', ExamController.saveUserSelectedOptionState);
// router.post('/evaluate-scorecard', ExamController.evaluateUserExamScorecard);

// module.exports = router;
const express = require('express');
const multer = require('multer');
const ExamController = require('../controllers/examController');

const router = express.Router();
const uploadMemoryStorage = multer({ storage: multer.memoryStorage() });

// 1. Core upload parsing module trigger path endpoint config URL mapping
router.post('/upload-pdf', uploadMemoryStorage.single('exam_pdf_file'), ExamController.uploadAndProcessPdf);

// 2. Clear randomized row layout mapping pull data endpoint sequence trace call
router.get('/pdf-questions/random', ExamController.getRandomizedQuestionsList);

// =========================================================================================================
// CLEAN BATCH SUBMISSION ENTRY POINT: Evaluates scorecard report summary metrics and batch writes straight to DB
// =========================================================================================================
router.post('/evaluate-scorecard', ExamController.evaluateUserExamScorecard);
// router.get('/performance-analytics', ExamController.getUserHistoricalPerformanceData);
router.post('/portal-login', ExamController.authenticatePortalUserCredentials);
router.post('/portal-logout-wipe', ExamController.clearPortalActiveQuestionRepositoryData);

module.exports = router;
