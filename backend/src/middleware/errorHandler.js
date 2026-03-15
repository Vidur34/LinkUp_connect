const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);

    if (err.code === 'P2002') {
        return res.status(409).json({
            error: true,
            message: 'A record with this value already exists',
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: true,
            message: 'Record not found',
        });
    }

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: true,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

const createError = (message, statusCode = 400) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};

module.exports = { errorHandler, createError };
