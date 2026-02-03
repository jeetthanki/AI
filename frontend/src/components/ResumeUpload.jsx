import { useState, useRef } from 'react'
import axios from 'axios'
import './ResumeUpload.css'

function ResumeUpload({ onUploadStart, onAnalysisComplete, onError, loading }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/msword' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile)
      } else {
        onError('Please upload a PDF or Word document')
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/msword' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(droppedFile)
      } else {
        onError('Please upload a PDF or Word document')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      onError('Please select a file to upload')
      return
    }

    onUploadStart()

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setUploadProgress(0)
      const response = await axios.post('/api/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000, // 60 second timeout
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      })
      setUploadProgress(100)
      setTimeout(() => {
        onAnalysisComplete(response.data)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      setUploadProgress(0)
      if (error.code === 'ECONNABORTED') {
        onError('Request timed out. Please try again with a smaller file or check your connection.')
      } else {
        onError(error.response?.data?.error || 'Failed to analyze resume. Please try again.')
      }
    }
  }

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="drop-zone-content">
            {file ? (
              <>
                <div className="file-icon">📄</div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📤</div>
                <p>Drag and drop your resume here</p>
                <p className="upload-hint">or click to browse</p>
                <p className="file-types">Supports: PDF, DOC, DOCX</p>
              </>
            )}
          </div>
        </div>

        {file && (
          <div className="file-preview-card">
            <div className="file-info">
              <span className="file-icon-small">📄</span>
              <div className="file-details">
                <p className="file-name-preview">{file.name}</p>
                <p className="file-size-preview">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  setUploadProgress(0)
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`analyze-button ${loading ? 'analyzing' : ''}`}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Analyze Resume</span>
            </>
          )}
        </button>

        {loading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress || 10}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {uploadProgress < 50 ? 'Uploading...' : uploadProgress < 90 ? 'Processing...' : 'Finalizing analysis...'}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ResumeUpload

