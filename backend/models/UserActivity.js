import mongoose from 'mongoose'

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  overallScore: Number,
  atsScore: Number,
  keywordScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const UserActivity = mongoose.model('UserActivity', userActivitySchema)

export default UserActivity


