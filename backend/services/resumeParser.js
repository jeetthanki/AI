import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import fs from 'fs/promises'

export async function extractTextFromResume(filePath, mimeType) {
  try {
    const fileBuffer = await fs.readFile(filePath)
    
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer)
      return data.text
    } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      return result.value
    } else {
      throw new Error('Unsupported file type')
    }
  } catch (error) {
    console.error('Error extracting text from resume:', error)
    throw new Error('Failed to extract text from resume')
  }
}

