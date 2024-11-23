module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/?error=unauthorized');  // Redirect to login if not authenticated
      }
    
  console.log('Session Data:', req.session);
    req.user = req.session.user;
    next();
  };
  