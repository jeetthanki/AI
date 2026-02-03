import mongoose from 'mongoose'

const analysisLogSchema = new mongoose.Schema({
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
  provider: {
    type: String,
    default: 'gemini'
  },
  model: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const AnalysisLog = mongoose.model('AnalysisLog', analysisLogSchema)

export default AnalysisLog


