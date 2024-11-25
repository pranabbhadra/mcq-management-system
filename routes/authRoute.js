const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');


// Signup Routes
router.get('/signup', (req, res) => {
  res.render('auth/signup', { errorMessage: null }); 
});
router.post('/signup', authController.signup); 

router.get('/', (req, res) => {
    let errorMessage = null;
    if (req.query.error && req.query.error == 'unauthorized') {
        errorMessage = "Please login to access this page";
    }
    res.render('auth/login', { errorMessage }); 
  });

router.post('/login', authController.login); 

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/dashboard');  
      }
      res.redirect('/');  
    });
  });
  
router.get('/dashboard',isAuthenticated, authController.dashboard);

// Add new MCQ route
router.get('/add',isAuthenticated, authController.addMCQ);  
router.post('/add',isAuthenticated, authController.createMCQ);  


// Edit Route
router.get('/edit/:id',isAuthenticated, authController.editMCQ);

// Update Route
router.post('/edit/:id',isAuthenticated, authController.updateMCQ);

// Delete Route
router.get('/delete/:id',isAuthenticated, authController.deleteMCQ);



module.exports = router;
