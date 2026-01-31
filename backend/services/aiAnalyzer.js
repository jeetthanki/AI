import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function analyzeResume(resumeText) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock analysis if no API key is provided
      return generateMockAnalysis(resumeText)
    }

    const prompt = `Analyze the following resume comprehensively, including ATS (Applicant Tracking System) compatibility. Return a JSON object with the following structure:
{
  "overallScore": <number between 0-100>,
  "atsScore": <number 0-100, how well optimized for ATS systems>,
  "keywordScore": <number 0-100, keyword optimization>,
  "formattingScore": <number 0-100, resume formatting quality>,
  "contactScore": <number 0-100, contact information completeness>,
  "educationScore": <number 0-100, education section quality>,
  "experienceScore": <number 0-100, experience section quality>,
  "skillsScore": <number 0-100, skills section quality>,
  "structureScore": <number 0-100, overall structure and organization>,
  "strengths": [<array of 3-5 key strengths>],
  "improvements": [<array of 3-5 areas for improvement>],
  "detailedAnalysis": "<detailed paragraph analysis>",
  "skills": [<array of all skills identified>],
  "recommendations": [<array of 3-5 actionable recommendations>],
  "atsRecommendations": [<array of 3-5 ATS-specific optimization tips>],
  "missingKeywords": [<array of common keywords that might be missing>]
}

Resume text:
${resumeText.substring(0, 4000)}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyzer. Analyze resumes and provide constructive feedback in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const responseText = completion.choices[0].message.content
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Invalid response format from AI')
    }
  } catch (error) {
    console.error('Error analyzing resume with AI:', error)
    // Fallback to mock analysis
    return generateMockAnalysis(resumeText)
  }
}

function generateMockAnalysis(resumeText) {
  // Enhanced keyword-based analysis as fallback
  const text = resumeText.toLowerCase()
  
  const skills = []
  const commonSkills = ['javascript', 'python', 'react', 'node', 'mongodb', 'sql', 'html', 'css', 'java', 'c++', 'git', 'docker', 'aws', 'linux', 'typescript', 'angular', 'vue', 'express', 'rest', 'api']
  commonSkills.forEach(skill => {
    if (text.includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1))
    }
  })

  // Check for various sections
  const hasEducation = text.includes('education') || text.includes('degree') || text.includes('university') || text.includes('college') || text.includes('bachelor') || text.includes('master')
  const hasExperience = text.includes('experience') || text.includes('work') || text.includes('employment') || text.includes('position') || text.includes('role')
  const hasProjects = text.includes('project') || text.includes('portfolio')
  const hasContact = (text.includes('@') || text.includes('email')) && (text.includes('phone') || text.includes('mobile') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText))
  const hasSummary = text.includes('summary') || text.includes('objective') || text.includes('profile')
  
  // Calculate individual scores
  let contactScore = 0
  if (text.includes('@') || text.includes('email')) contactScore += 30
  if (text.includes('phone') || text.includes('mobile') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText)) contactScore += 30
  if (text.includes('linkedin') || text.includes('github') || text.includes('portfolio')) contactScore += 20
  if (text.includes('address') || text.includes('location')) contactScore += 20
  
  let educationScore = hasEducation ? 70 : 20
  if (text.includes('gpa') || text.includes('grade')) educationScore += 15
  if (text.includes('honor') || text.includes('dean')) educationScore += 15
  
  let experienceScore = hasExperience ? 60 : 20
  const experienceCount = (text.match(/experience|work|employment|position|role/gi) || []).length
  if (experienceCount > 2) experienceScore += 20
  if (text.includes('achievement') || text.includes('accomplish')) experienceScore += 10
  if (/\d+/.test(text)) experienceScore += 10 // Has numbers/metrics
  
  let skillsScore = skills.length > 0 ? Math.min(60 + (skills.length * 2), 100) : 20
  if (skills.length > 5) skillsScore += 20
  if (text.includes('certification') || text.includes('certificate')) skillsScore += 10
  
  let formattingScore = 60
  if (text.length > 500 && text.length < 2000) formattingScore += 20
  if (!text.includes('table') && !text.includes('column')) formattingScore += 10
  if (text.split('\n').length > 10) formattingScore += 10
  
  let structureScore = 50
  if (hasContact) structureScore += 10
  if (hasSummary) structureScore += 10
  if (hasEducation) structureScore += 10
  if (hasExperience) structureScore += 15
  if (hasProjects) structureScore += 10
  if (skills.length > 0) structureScore += 5
  
  // ATS Score calculation
  let atsScore = 50
  if (hasContact) atsScore += 10
  if (skills.length > 3) atsScore += 10
  if (hasEducation) atsScore += 10
  if (hasExperience) atsScore += 10
  if (text.length > 500 && text.length < 2000) atsScore += 10
  if (!text.includes('table') && !text.includes('image') && !text.includes('graphic')) atsScore += 10
  
  // Keyword Score
  const keywordDensity = skills.length / Math.max(text.split(/\s+/).length / 100, 1)
  let keywordScore = Math.min(keywordDensity * 20, 100)
  
  // Overall score
  let overallScore = Math.round((atsScore + educationScore + experienceScore + skillsScore + formattingScore + structureScore) / 6)
  
  const strengths = []
  const improvements = []
  const atsRecommendations = []
  const missingKeywords = []
  
  if (hasEducation) {
    strengths.push('Education section is present')
  } else {
    improvements.push('Add an education section')
    atsRecommendations.push('Include education section for better ATS parsing')
  }
  
  if (hasExperience) {
    strengths.push('Work experience is documented')
  } else {
    improvements.push('Include work experience or internships')
  }
  
  if (skills.length > 0) {
    strengths.push(`Strong technical skills identified (${skills.length} skills)`)
  } else {
    improvements.push('List relevant technical skills')
    atsRecommendations.push('Add a dedicated skills section with relevant keywords')
  }
  
  if (hasProjects) {
    strengths.push('Projects section included')
  } else {
    improvements.push('Add a projects section to showcase your work')
  }
  
  if (hasContact) {
    strengths.push('Contact information is present')
  } else {
    improvements.push('Ensure contact information is complete')
    atsRecommendations.push('Include email and phone number in a standard format')
  }
  
  if (text.length > 500) {
    strengths.push('Resume has sufficient detail')
  } else {
    improvements.push('Add more detail to your resume')
  }
  
  // ATS-specific recommendations
  if (!hasSummary) {
    atsRecommendations.push('Add a professional summary or objective section')
  }
  
  if (text.includes('table') || text.includes('column')) {
    atsRecommendations.push('Avoid using tables or complex formatting - ATS systems may not parse them correctly')
  }
  
  if (skills.length < 5) {
    atsRecommendations.push('Include more relevant keywords and skills from the job description')
  }
  
  // Missing keywords suggestions
  const suggestedKeywords = ['leadership', 'communication', 'problem solving', 'teamwork', 'project management']
  suggestedKeywords.forEach(keyword => {
    if (!text.includes(keyword.toLowerCase())) {
      missingKeywords.push(keyword)
    }
  })

  return {
    overallScore: Math.min(overallScore, 100),
    atsScore: Math.min(atsScore, 100),
    keywordScore: Math.min(keywordScore, 100),
    formattingScore: Math.min(formattingScore, 100),
    contactScore: Math.min(contactScore, 100),
    educationScore: Math.min(educationScore, 100),
    experienceScore: Math.min(experienceScore, 100),
    skillsScore: Math.min(skillsScore, 100),
    structureScore: Math.min(structureScore, 100),
    strengths: strengths.length > 0 ? strengths : ['Resume structure is present'],
    improvements: improvements.length > 0 ? improvements : ['Continue building your experience'],
    detailedAnalysis: `This resume contains ${text.split(/\s+/).length} words. ${hasEducation ? 'Education background is included. ' : ''}${hasExperience ? 'Work experience is documented. ' : ''}${skills.length > 0 ? `Technical skills identified: ${skills.slice(0, 5).join(', ')}. ` : ''}The ATS compatibility score is ${atsScore}/100. Consider tailoring your resume to highlight your most relevant achievements and skills for better ATS parsing.`,
    skills: skills.length > 0 ? skills : ['Skills section needed'],
    recommendations: [
      'Use action verbs to describe your achievements',
      'Quantify your accomplishments with numbers and metrics',
      'Tailor your resume to the job description',
      'Keep formatting clean and consistent',
      'Proofread for grammar and spelling errors'
    ],
    atsRecommendations: atsRecommendations.length > 0 ? atsRecommendations : [
      'Use standard section headings (Experience, Education, Skills)',
      'Avoid graphics, images, and complex formatting',
      'Save as PDF to preserve formatting',
      'Include relevant keywords from job descriptions'
    ],
    missingKeywords: missingKeywords.length > 0 ? missingKeywords : []
  }
}

