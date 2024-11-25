const User = require('../models/User'); 
const MCQ = require('../models/MCQ'); 
const Option = require('../models/Option');
const CorrectAnswer = require('../models/CorrectAnswer');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

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
      password: hashedPassword, 
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
          };
    
    }

    res.redirect('/dashboard'); 
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
    const mcqs = await MCQ.aggregate([
      {
        $lookup: {
          from: 'users', 
          localField: 'user', 
          foreignField: '_id', 
          as: 'user', 
        },
      },
      {
        $lookup: {
          from: 'options', 
          localField: '_id', 
          foreignField: 'mcq',
          as: 'options',
        },
      },
      {
        $lookup: {
          from: 'correctanswers', 
          localField: '_id', 
          foreignField: 'mcq', 
          as: 'correctAnswer', 
        },
      },
      {
        $unwind: { path: '$user'}, 
      },
      {
        $unwind: { path: '$correctAnswer'}, 
      },
      {
        $project: {
          question: 1,
          user: { username: 1, email: 1 }, 
          options: { text: 1 }, 
          correctAnswer: { text: 1 }, 
        },
      },
    ]);

    console.log('mcqs:', mcqs);
    
    res.render('dashboard', {
      mcqs,
      errorMessage: null,
      user: req.user,
    });
  } catch (error) {
    console.error('Error fetching MCQs:', error);
    res.render('dashboard', { mcqs: [], errorMessage: 'Failed to load MCQs. Please try again later.' });
  }
};

// Add MCQ Controller to render add page
exports.addMCQ = (req, res) => {
    res.render('add', { errorMessage: null });
  };
  
  exports.createMCQ = async (req, res) => {
    const { question, options, correctAnswer } = req.body;
    const optionsArray = options.split(',').map(option => option.trim());
  
    try {
      // Validate if correctAnswer is one of the options
      if (!optionsArray.includes(correctAnswer)) {
        return res.render('add', { errorMessage: 'Correct answer must be one of the options provided.' });
      }
  
      const newMCQ = new MCQ({
        question,
        user: req.user._id,
      });
      await newMCQ.save();
  
      const savedOptions = await Promise.all(
        optionsArray.map(optionText =>
          new Option({ text: optionText, mcq: newMCQ._id }).save()
        )
      );
  
      const savedCorrectAnswer = await new CorrectAnswer({
        text: correctAnswer,
        mcq: newMCQ._id,
      }).save();
  
      res.redirect('dashboard'); 
    } catch (error) {
      console.error('Error creating MCQ:', error);
      res.render('add', { errorMessage: 'Failed to add MCQ. Please try again.' });
    }
  };
 
  

// Edit Controller to handle the editing of MCQs

exports.editMCQ = async (req, res) => {
  const { id } = req.params;

  try {
    let errorMessage = null;
    if (req.query.error && req.query.error == 'ansNotMatched') {
        errorMessage = "Correct answer must be one of the options provided.";
    }
    const mcq = await MCQ.aggregate([
      {
        $match: { _id:new mongoose.Types.ObjectId(id) },  // Match by the MCQ id
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'options',
          localField: '_id',
          foreignField: 'mcq',
          as: 'options',
        },
      },
      {
        $lookup: {
          from: 'correctanswers',
          localField: '_id',
          foreignField: 'mcq',
          as: 'correctAnswer',
        },
      },
      {
        $unwind: { path: '$user' },  
      },
      {
        $unwind: { path: '$correctAnswer' },  
      },
      {
        $project: {
          question: 1,
          user: { username: 1, email: 1 },
          options: { text: 1 },
          correctAnswer: { text: 1 },
        },
      },
    ]);

    // If MCQ not found
    if (!mcq || mcq.length === 0) {
      console.error('MCQ not found');
      return res.redirect('/dashboard');
    }

    // Since the result is an array, get the first (and only) item
    const mcqData = mcq[0];

    console.log('MCQ data:', mcqData);

    // Render the edit view with the populated MCQ data
    res.render('edit', { mcq: mcqData, errorMessage: errorMessage });
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

      if (!optionsArray.includes(correctAnswer)) {
        return res.redirect(`/edit/${id}?error=ansNotMatched`);  
      }


    await Option.deleteMany({ mcq: id }); 
    const savedOptions = await Promise.all(
      optionsArray.map(optionText =>
        new Option({ text: optionText, mcq: id }).save()
      )
    );

    await CorrectAnswer.deleteMany({ mcq: id });
    // Save new correct answer
    await new CorrectAnswer({
      text: correctAnswer,
      mcq: id,
    }).save();

    await MCQ.findByIdAndUpdate(id, { question });

      res.redirect('/dashboard'); 
    } catch (error) {
      console.error('Error updating MCQ:', error);res.render('edit', {
        errorMessage: 'Failed to update MCQ. Please try again.',
        mcq: { _id: id, question, options: optionsArray, correctAnswer }, 
      });
    }
  };
  
  // Delete Controller to handle MCQ deletion
  exports.deleteMCQ = async (req, res) => {
    const { id } = req.params;
    try {
      await Option.deleteMany({ mcq: id });
      await CorrectAnswer.deleteMany({ mcq: id });
      await MCQ.findByIdAndDelete(id);

      res.redirect('/dashboard'); 
    } catch (error) {
      console.error('Error deleting MCQ:', error);
      res.redirect('/dashboard');
    }
  };
  

