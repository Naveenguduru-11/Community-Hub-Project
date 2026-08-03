const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Super Admin has master authorization across all API features and routes
    if (req.user.role === 'SUPER_ADMIN' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Role '${req.user.role}' is not authorized to perform this operation` 
    });
  };
};

module.exports = { authorize };
