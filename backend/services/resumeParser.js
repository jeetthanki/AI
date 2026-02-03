import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import fs from 'fs/promises'

export async function extractTextFromResume(filePath, mimeType) {
  try {
    // Verify file exists
    try {
      await fs.access(filePath)
    } catch (accessError) {
      throw new Error(`File not found at path: ${filePath}`)
    }
    
    const fileBuffer = await fs.readFile(filePath)
    console.log(`[Text Extraction] File size: ${fileBuffer.length} bytes, MIME type: ${mimeType}`)
    
    if (fileBuffer.length === 0) {
      throw new Error('File is empty (0 bytes)')
    }
    
    if (mimeType === 'application/pdf') {
      // Verify it's actually a PDF by checking magic bytes
      const pdfHeader = fileBuffer.toString('ascii', 0, 4)
      if (pdfHeader !== '%PDF') {
        console.warn(`[Text Extraction] File doesn't start with PDF magic bytes. Got: ${pdfHeader}`)
        // Continue anyway, might still be valid
      }
      
      // Parse PDF - pdf-parse handles all pages by default
      let data
      try {
        data = await pdfParse(fileBuffer)
      } catch (parseError) {
        console.error('[Text Extraction] PDF parse error:', parseError.message)
        if (parseError.message.includes('password') || parseError.message.includes('encrypted')) {
          throw new Error('PDF is password-protected or encrypted. Please remove password protection and try again.')
        }
        throw new Error(`PDF parsing failed: ${parseError.message}`)
      }
      
      let extractedText = data.text || ''
      
      console.log(`[Text Extraction] PDF parsed: ${data.numpages} pages, text length: ${extractedText.length}`)
      
      // Validate that we got actual text content, not metadata
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('This appears to be a scanned PDF (image-based) or the PDF contains no extractable text. Please use a text-based PDF or convert the file to text format.')
      }
      
      // Check if extracted text looks like JSON/metadata (common issue)
      const trimmedText = extractedText.trim()
      if (trimmedText.startsWith('{') && trimmedText.includes('"') && trimmedText.includes(':')) {
        console.error('[Text Extraction] ERROR: Extracted text appears to be JSON metadata, not resume content!')
        throw new Error('PDF text extraction failed - received metadata instead of resume text. The PDF may be corrupted or in an unsupported format. Please try a different PDF file or convert it to a Word document.')
      }
      
      // Clean up the text (preserve structure but normalize whitespace)
      extractedText = extractedText
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n')   // Handle Mac line endings
        .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
        .trim()
      
      // Validate minimum content quality
      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length
      console.log(`[Text Extraction] Extracted ${extractedText.length} characters, ${wordCount} words from PDF (${data.numpages} pages)`)
      
      if (extractedText.length < 50) {
        throw new Error('PDF appears to contain very little text. Please ensure it is a text-based PDF with readable content.')
      }
      
      if (wordCount < 20) {
        throw new Error('PDF contains insufficient text content. Please ensure your resume has substantial text content.')
      }
      
      // Log a preview of extracted text for debugging (first 200 chars)
      console.log(`[Text Extraction] Text preview: ${extractedText.substring(0, 200).replace(/\n/g, ' ')}...`)
      
      return extractedText
      
    } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      let extractedText = result.value || ''
      
      // Clean up the text
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
      
      console.log(`[Text Extraction] Extracted ${extractedText.length} characters from Word document`)
      
      if (extractedText.length < 10) {
        throw new Error('Word document appears to be empty or unreadable. Please ensure it contains text content.')
      }
      
      if (result.messages && result.messages.length > 0) {
        console.warn('[Text Extraction] Word parsing warnings:', result.messages)
      }
      
      return extractedText
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }
  } catch (error) {
    console.error('[Text Extraction] Error details:', {
      message: error.message,
      stack: error.stack,
      filePath: filePath,
      mimeType: mimeType
    })
    
    // Provide more helpful error messages
    if (error.message.includes('scanned') || error.message.includes('image-based')) {
      throw error
    } else if (error.message.includes('empty') || error.message.includes('unreadable')) {
      throw error
    } else if (error.message.includes('timeout')) {
      throw new Error('File processing timed out. The file might be too large or corrupted.')
    } else {
      throw new Error(`Failed to extract text: ${error.message}. Please ensure the file is not corrupted and contains readable text.`)
    }
  }
}

