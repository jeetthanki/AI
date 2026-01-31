import { useState } from 'react'
import axios from 'axios'
import './AnalysisResults.css'

function getScoreColor(score) {
  if (!score && score !== 0) return ''
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  if (score >= 40) return 'score-fair'
  return 'score-poor'
}

function AnalysisResults({ result }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!result.resumeId) {
      alert('Resume ID not available')
      return
    }

    setDownloading(true)
    try {
      const response = await axios.get(`/api/resume/${result.resumeId}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `resume-analysis-${result.resumeId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Analysis Results</h2>
        {result.resumeId && (
          <button 
            onClick={handleDownload} 
            className="download-button"
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : '📥 Download Report'}
          </button>
        )}
      </div>
      
      <div className="results-grid">
        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">⭐</span>
            <h3>Overall Score</h3>
          </div>
          <div className="card-content">
            <div className="score-circle">
              <span className="score-value">{result.overallScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">🤖</span>
            <h3>ATS Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.atsScore)}`}>
              <span className="score-value">{result.atsScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Applicant Tracking System compatibility</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">🔑</span>
            <h3>Keyword Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.keywordScore)}`}>
              <span className="score-value">{result.keywordScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Keyword optimization</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">📐</span>
            <h3>Formatting Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.formattingScore)}`}>
              <span className="score-value">{result.formattingScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Formatting quality</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">📧</span>
            <h3>Contact Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.contactScore)}`}>
              <span className="score-value">{result.contactScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Contact information</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">🎓</span>
            <h3>Education Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.educationScore)}`}>
              <span className="score-value">{result.educationScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Education section</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">💼</span>
            <h3>Experience Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.experienceScore)}`}>
              <span className="score-value">{result.experienceScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Work experience</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">🛠️</span>
            <h3>Skills Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.skillsScore)}`}>
              <span className="score-value">{result.skillsScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Skills section</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <h3>Structure Score</h3>
          </div>
          <div className="card-content">
            <div className={`score-circle ${getScoreColor(result.structureScore)}`}>
              <span className="score-value">{result.structureScore || 'N/A'}</span>
              <span className="score-label">/ 100</span>
            </div>
            <p className="score-description">Overall structure</p>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">💼</span>
            <h3>Strengths</h3>
          </div>
          <div className="card-content">
            <ul className="strengths-list">
              {result.strengths && result.strengths.length > 0 ? (
                result.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))
              ) : (
                <li>No strengths identified</li>
              )}
            </ul>
          </div>
        </div>

        <div className="result-card">
          <div className="card-header">
            <span className="card-icon">⚠️</span>
            <h3>Areas for Improvement</h3>
          </div>
          <div className="card-content">
            <ul className="improvements-list">
              {result.improvements && result.improvements.length > 0 ? (
                result.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))
              ) : (
                <li>No improvements suggested</li>
              )}
            </ul>
          </div>
        </div>

        <div className="result-card full-width">
          <div className="card-header">
            <span className="card-icon">📝</span>
            <h3>Detailed Analysis</h3>
          </div>
          <div className="card-content">
            <div className="detailed-analysis">
              {result.detailedAnalysis ? (
                <p>{result.detailedAnalysis}</p>
              ) : (
                <p>No detailed analysis available</p>
              )}
            </div>
          </div>
        </div>

        {result.skills && result.skills.length > 0 && (
          <div className="result-card full-width">
            <div className="card-header">
              <span className="card-icon">🛠️</span>
              <h3>Skills Identified</h3>
            </div>
            <div className="card-content">
              <div className="skills-tags">
                {result.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {result.recommendations && result.recommendations.length > 0 && (
          <div className="result-card full-width">
            <div className="card-header">
              <span className="card-icon">💡</span>
              <h3>General Recommendations</h3>
            </div>
            <div className="card-content">
              <ul className="recommendations-list">
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result.atsRecommendations && result.atsRecommendations.length > 0 && (
          <div className="result-card full-width">
            <div className="card-header">
              <span className="card-icon">🤖</span>
              <h3>ATS Optimization Tips</h3>
            </div>
            <div className="card-content">
              <ul className="ats-recommendations-list">
                {result.atsRecommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result.missingKeywords && result.missingKeywords.length > 0 && (
          <div className="result-card full-width">
            <div className="card-header">
              <span className="card-icon">🔍</span>
              <h3>Suggested Keywords to Add</h3>
            </div>
            <div className="card-content">
              <div className="keywords-suggestions">
                <p className="keywords-hint">Consider adding these keywords to improve your resume's visibility:</p>
                <div className="keywords-tags">
                  {result.missingKeywords.map((keyword, index) => (
                    <span key={index} className="keyword-suggestion-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalysisResults

