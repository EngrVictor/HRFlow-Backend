import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

// Helper: load user's roles and permissions (cached on req to avoid multiple DB calls)
const loadUserPermissions = async (userId) => {
  // Populate roles and their permissions
  const userWithRoles = await User.findById(userId)
    .populate({
      path: 'roles',           // assuming User has a 'roles' field referencing Role
      populate: {
        path: 'permissions',   // Role has 'permissions' field referencing Permission
        model: 'Permission'
      }
    })
    .lean();

  if (!userWithRoles) return { roles: [], permissions: [] };

  const roles = userWithRoles.roles || [];
  // Flatten permissions from all roles
  const permissionsSet = new Set();
  roles.forEach(role => {
    if (role.permissions) {
      role.permissions.forEach(perm => {
        permissionsSet.add(`${perm.resource}:${perm.action}`);
      });
    }
  });
  return { roles: roles.map(r => r.name), permissions: Array.from(permissionsSet) };
}

// Middleware to check if user has at least one of the required roles
const requireRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    // Load roles & permissions if not already attached
    if (!req.userRoles) {
      const { roles, permissions } = await loadUserPermissions(req.user._id);
      req.userRoles = roles;
      req.userPermissions = permissions;
    }

    const hasRole = allowedRoles.some(role => req.userRoles.includes(role));
    if (hasRole) return next();

    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  };
}

// Middleware to check if user has a specific permission (resource:action)
// Example: requirePermission('leave_requests', 'approve')
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    if (!req.userPermissions) {
      const { roles, permissions } = await loadUserPermissions(req.user._id);
      req.userRoles = roles;
      req.userPermissions = permissions;
    }

    const required = `${resource}:${action}`;
    if (req.userPermissions.includes(required)) return next();

    return res.status(403).json({ error: `Forbidden: missing permission ${required}` });
  };
}

module.exports = { requireRoles, requirePermission };