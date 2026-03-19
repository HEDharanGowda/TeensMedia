function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
  });
}

function errorHandler(err, req, res, next) {
  console.error('Server Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    status: 'ERROR',
    message: err.response?.data?.error?.message || err.message || 'Internal server error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
