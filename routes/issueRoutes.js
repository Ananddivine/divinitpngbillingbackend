// issueRouts.js
const express = require('express');
const { createIssue, getIssues, upload, replyToIssue, getUserIssues, deleteIssue } = require('../controllers/issueController');
const router = express.Router();
const  {fetchUser}  = require('../middleware/authMiddleware');
// POST route to create an issue with attachments
router.post('/', fetchUser, upload.array('attachments'), createIssue);
const { fetchUserIssues } = require('../controllers/issueController');

// GET route to fetch all issues
router.get('/', getIssues);

// POST route to reply to an issue
router.post('/:issueId/reply', fetchUser, replyToIssue); 

router.get('/user-issues', fetchUser, getUserIssues); 

router.get('/issues', fetchUser, fetchUserIssues);

router.delete('/issue/:issueId', fetchUser, deleteIssue); // Route to delete a specific issue

module.exports = router;
