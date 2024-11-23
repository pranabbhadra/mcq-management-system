const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');


// Signup Routes
router.get('/signup', (req, res) => {
  res.render('auth/signup', { errorMessage: null }); // Render the signup page
});
router.post('/signup', authController.signup); // Handle signup form submission

// Signup Routes
router.get('/', (req, res) => {
    let errorMessage = null;
    if (req.query.error && req.query.error == 'unauthorized') {
        errorMessage = "Please login to access this page";
    }
    res.render('auth/login', { errorMessage }); // Render the signup page
  });

router.post('/login', authController.login); // Handle login form submission

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/dashboard');  // In case of error, redirect to dashboard
      }
      res.redirect('/');  // Redirect to login page after logging out
    });
  });
  
router.get('/dashboard',isAuthenticated, authController.dashboard);

// Add new MCQ route
router.get('/add',isAuthenticated, authController.addMCQ);  // Render the page for adding MCQ
router.post('/add',isAuthenticated, authController.createMCQ);  // Handle form submission for creating MCQ


// Edit Route
router.get('/edit/:id',isAuthenticated, authController.editMCQ);

// Update Route
router.post('/edit/:id',isAuthenticated, authController.updateMCQ);

// Delete Route
router.get('/delete/:id',isAuthenticated, authController.deleteMCQ);



module.exports = router;
