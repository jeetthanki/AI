import express from 'express'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'
import Resume from '../models/Resume.js'
import { extractTextFromResume } from '../services/resumeParser.js'
import { analyzeResume } from '../services/aiAnalyzer.js'
import { authenticate } from '../middleware/auth.js'
import { generatePDFReport } from '../services/reportGenerator.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '../uploads')
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false)
    }
  }
})

// Analyze resume endpoint
router.post('/analyze', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Extract text from resume
    const resumeText = await extractTextFromResume(req.file.path, req.file.mimetype)

    // Analyze with AI
    const analysis = await analyzeResume(resumeText)

    // Save to database
    const resume = new Resume({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      analysis: analysis
    })

    await resume.save()

    // Clean up file after processing (optional - you might want to keep it)
    // await fs.unlink(req.file.path)

    res.json({
      success: true,
      ...resume.analysis,
      resumeId: resume._id
    })
  } catch (error) {
    console.error('Error processing resume:', error)
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError)
      }
    }

    res.status(500).json({ 
      error: error.message || 'Failed to analyze resume' 
    })
  }
})

// Get analysis history (optional endpoint)
router.get('/history', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('originalName uploadedAt analysis.overallScore')
      .sort({ uploadedAt: -1 })
      .limit(10)
    
    res.json({ resumes })
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// Get specific resume analysis
router.get('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }
    res.json({
      success: true,
      ...resume.analysis,
      resumeId: resume._id
    })
  } catch (error) {
    console.error('Error fetching resume:', error)
    res.status(500).json({ error: 'Failed to fetch resume analysis' })
  }
})

// Download analysis report as PDF
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
      .populate('user', 'name email')
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }
    
    const pdfBuffer = await generatePDFReport(resume.analysis, resume.user)
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="resume-analysis-${resume._id}.pdf"`)
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF report:', error)
    res.status(500).json({ error: 'Failed to generate PDF report' })
  }
})

export default router

