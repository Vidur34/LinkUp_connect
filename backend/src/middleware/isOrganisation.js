// Middleware: only allows organisation accounts
const isOrganisation = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    if (req.user.accountType !== 'organisation') {
        return res.status(403).json({ error: true, message: 'Organisation account required' });
    }
    next();
};

module.exports = isOrganisation;
