import mongoose from 'mongoose'

const recommendationSetSchema = new mongoose.Schema({
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
  strengths: {
    type: [String],
    default: []
  },
  improvements: {
    type: [String],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  },
  atsRecommendations: {
    type: [String],
    default: []
  },
  missingKeywords: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const RecommendationSet = mongoose.model('RecommendationSet', recommendationSetSchema)

export default RecommendationSet


