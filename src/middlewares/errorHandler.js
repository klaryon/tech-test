module.exports = async function(err, req, res, next) {
  if(!err) next();
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong!';
  
  res.status(err.statusCode).json({ success: false, message: err.message, data: err.data });
};
