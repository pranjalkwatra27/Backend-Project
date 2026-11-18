export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  if (err.code === 11000) {
    let field = Object.keys(err.keyValue)[0];
    let message = `Duplicate value entered for ${field}. It must be unique.`;
    if (err.keyPattern && err.keyPattern.jobId && err.keyPattern.candidateId) {
      message = 'You have already applied for this job. Duplicate applications are not allowed.';
    }
    return res.status(409).json({ success: false, message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 2MB.' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
