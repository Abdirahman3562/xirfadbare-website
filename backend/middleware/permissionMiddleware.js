const checkPermission = (permissionKey) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user' });
        }

        // Admin always has all permissions
        if (req.user.isSuperAdmin) {
            return next();
        }

        // Check if the permission key exists in user permissions
        if (req.user.permissions && req.user.permissions.includes(permissionKey)) {
            return next();
        }

        res.status(403).json({ message: `Access denied: missing permission '${permissionKey}'` });
    };
};

export { checkPermission };
