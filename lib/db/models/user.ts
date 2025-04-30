import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
  refreshInterval: { type: Number, default: 60 },
  alerts: [
    {
      type: { type: String, enum: ['validator', 'network', 'stake'] },
      condition: String,
      value: mongoose.Schema.Types.Mixed,
      enabled: Boolean,
    },
  ],
  favoriteValidators: [
    {
      identity: String,
      name: String,
      addedAt: Date,
    },
  ],
  dashboardLayout: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
