// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  oldData: mongoose.Schema.Types.Mixed,
  newData: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;