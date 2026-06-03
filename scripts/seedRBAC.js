import mongoose from 'mongoose';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

const seedRBAC = async () => {
  await mongoose.connect('mongodb://localhost:27017/hr_system');

  // Define all permissions
  const permissionsData = [
    { resource: 'employee_profile', action: 'read' },
    { resource: 'employee_profile', action: 'update' },
    { resource: 'employee_profile', action: 'delete' },
    { resource: 'leave_requests', action: 'create' },
    { resource: 'leave_requests', action: 'read' },
    { resource: 'leave_requests', action: 'approve' },
    { resource: 'recruitment', action: 'create' },
    { resource: 'recruitment', action: 'read' },
    { resource: 'recruitment', action: 'update' },
    { resource: 'performance_reviews', action: 'create' },
    { resource: 'performance_reviews', action: 'read' },
    { resource: 'analytics', action: 'read' },
  ];

  // Upsert permissions
  const permissions = {};
  for (const p of permissionsData) {
    const perm = await Permission.findOneAndUpdate(
      { resource: p.resource, action: p.action },
      p,
      { upsert: true, new: true }
    );
    permissions[`${p.resource}:${p.action}`] = perm._id;
  }

  // Define roles with their permission keys
  const rolesData = [
    { name: 'admin', permissions: Object.values(permissions) }, // all permissions
    { name: 'hr_manager', permissions: [
      permissions['employee_profile:read'],
      permissions['employee_profile:update'],
      permissions['leave_requests:read'],
      permissions['leave_requests:approve'],
      permissions['recruitment:create'],
      permissions['recruitment:read'],
      permissions['recruitment:update'],
      permissions['performance_reviews:create'],
      permissions['performance_reviews:read'],
      permissions['analytics:read']
    ]},
    { name: 'manager', permissions: [
      permissions['employee_profile:read'],
      permissions['leave_requests:read'],
      permissions['leave_requests:approve'],
      permissions['performance_reviews:read'],
      permissions['performance_reviews:create']
    ]},
    { name: 'employee', permissions: [
      permissions['employee_profile:read'],
      permissions['employee_profile:update'],  // own profile only (enforced in business logic)
      permissions['leave_requests:create'],
      permissions['leave_requests:read']
    ]}
  ];

  for (const roleData of rolesData) {
    await Role.findOneAndUpdate(
      { name: roleData.name },
      { permissions: roleData.permissions },
      { upsert: true }
    );
  }

  console.log('RBAC seeded successfully');
  process.exit(0);
}

seedRBAC().catch(err => { console.error(err); process.exit(1); });