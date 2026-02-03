import mongoose from 'mongoose'

const skillSnapshotSchema = new mongoose.Schema({
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
  skills: {
    type: [String],
    default: []
  },
  primarySkills: {
    type: [String],
    default: []
  },
  totalSkills: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const SkillSnapshot = mongoose.model('SkillSnapshot', skillSnapshotSchema)

export default SkillSnapshot


