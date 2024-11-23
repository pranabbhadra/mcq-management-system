const User = require('../models/User'); // Import the User model
const MCQ = require('../models/MCQ'); // Import the MCQ model
const bcrypt = require('bcrypt'); // For password hashing

// Controller for handling signup
exports.signup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate inputs
  if (!username || !email || !password || !confirmPassword) {
    return res.render('auth/signup', {
      errorMessage: 'All fields are required.',
    });
  }

  if (password !== confirmPassword) {
    return res.render('auth/signup', {
      errorMessage: 'Passwords do not match.',
    });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/signup', {
        errorMessage: 'Email is already registered.',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Save hashed password
    });

    await newUser.save();

    // Redirect to login page after successful signup
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('auth/signup', {
      errorMessage: 'Something went wrong. Please try again later.',
    });
  }
};

// Controller for handling login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.render('auth/login', {
      errorMessage: 'All fields are required.',
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        errorMessage: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', {
        errorMessage: 'Invalid email or password.',
      });
    } else {
        req.session.user = {
            _id: user._id,
            email: user.email,
            username: user.username,
            // You can store any other user data here
          };
    
    }

    // Successful login logic (set session or token)
    res.redirect('/dashboard'); // Redirect to dashboard or another protected route
  } catch (error) {
    console.error(error);
    res.render('auth/login', {
      errorMessage: 'Something went wrong. Please try again later.',
    });
  }
};


// Dashboard Controller
exports.dashboard = async (req, res) => {
  try {
    // Fetch all MCQs from the database
    const mcqs = await MCQ.find().populate('user', 'username email');
    console.log(mcqs);
    // Render the dashboard view with the MCQs
    res.render('dashboard', { mcqs, errorMessage: null, user: req.user  });
  } catch (error) {
    console.error('Error fetching MCQs:', error);
    res.render('dashboard', { mcqs: [], errorMessage: 'Failed to load MCQs. Please try again later.' });
  }
};

// Add MCQ Controller to render add page
exports.addMCQ = (req, res) => {
    res.render('add', { errorMessage: null });
  };
  
  // Add new MCQ in the database
  exports.createMCQ = async (req, res) => {
    const { question, options, correctAnswer } = req.body;
    const optionsArray = options.split(',').map(option => option.trim());
  
    try {
      const newMCQ = new MCQ({
        question,
        options: optionsArray,
        correctAnswer,
        user: req.user._id,
      });
  
      await newMCQ.save();
      res.redirect('dashboard'); // Redirect to the dashboard after adding MCQ
    } catch (error) {
      console.error('Error creating MCQ:', error);
      res.render('add', { errorMessage: 'Failed to add MCQ. Please try again.' });
    }
  };
  

// Edit Controller to handle the editing of MCQs
exports.editMCQ = async (req, res) => {
    const { id } = req.params;
    try {
      const mcq = await MCQ.findById(id);
      if (!mcq) {
        return res.redirect('/dashboard'); // Redirect if MCQ not found
      }
      res.render('edit', { mcq, errorMessage: null }); // Render the edit page with the current MCQ data
    } catch (error) {
      console.error('Error fetching MCQ for editing:', error);
      res.redirect('/dashboard');
    }
  };
  
  // Update Controller to save edited MCQ
  exports.updateMCQ = async (req, res) => {
    const { id } = req.params;
    const { question, options, correctAnswer } = req.body;
    console.log('options',options);
    
    const optionsArray = options.split(',').map(option => option.trim());
    try {
      await MCQ.findByIdAndUpdate(id, { question, options:optionsArray, correctAnswer });
      res.redirect('/dashboard'); // Redirect back to the dashboard
    } catch (error) {
      console.error('Error updating MCQ:', error);
      res.render('edit', { errorMessage: 'Failed to update MCQ. Please try again.' });
    }
  };
  
  // Delete Controller to handle MCQ deletion
  exports.deleteMCQ = async (req, res) => {
    const { id } = req.params;
    try {
      await MCQ.findByIdAndDelete(id);
      res.redirect('/dashboard'); // Redirect to dashboard after deletion
    } catch (error) {
      console.error('Error deleting MCQ:', error);
      res.redirect('/dashboard');
    }
  };
  

