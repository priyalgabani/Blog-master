
  const authorize = (req, res, next) => {
    if (req.cookies.role !== 'admin') {
      res.send('You are not authorized to access this page.');
    } else {
      next();
    }
  };
  const isAuthenticated = (req, res, next) =>{
    console.log(req.cookies.id);
    if (req.cookies.id) {
      next();
    } else {
      res.status(401).json({ error: 'Authentication required' });
    }
  }
  module.exports = { authorize , isAuthenticated }