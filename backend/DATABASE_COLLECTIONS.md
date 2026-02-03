# Database Collections Reference

## Overview
This application uses **6 MongoDB collections** to store resume analysis data.

## Collections List

### 1. **users** (User accounts)
- Stores user registration and authentication data
- Fields: `name`, `email`, `password`, `role`, `createdAt`

### 2. **resumes** (Resume documents)
- Stores uploaded resume files and analysis results
- Fields: `user`, `filename`, `originalName`, `filePath`, `fileSize`, `mimeType`, `analysis`, `uploadedAt`
- The `analysis` field contains all scores and feedback

### 3. **analysislogs** (AI analysis logs)
- Logs every AI analysis request
- Fields: `user`, `resume`, `provider` (gemini), `model` (gemini-2.5-flash), `success`, `errorMessage`, `createdAt`
- Tracks which analyses succeeded/failed

### 4. **skillsnapshots** (Skills extracted from resumes)
- Stores skills identified in each resume
- Fields: `user`, `resume`, `skills` (array), `primarySkills` (top 5), `totalSkills` (count), `createdAt`

### 5. **recommendationsets** (Recommendations and feedback)
- Stores all recommendations and feedback for each resume
- Fields: `user`, `resume`, `strengths`, `improvements`, `recommendations`, `atsRecommendations`, `missingKeywords`, `createdAt`

### 6. **useractivities** (User activity scores)
- Tracks scores for analytics and trends
- Fields: `user`, `resume`, `overallScore`, `atsScore`, `keywordScore`, `createdAt`

## How Collections Are Created

**Important:** MongoDB collections are created automatically when the first document is inserted. 

- Collections appear in MongoDB Compass **only after** you analyze at least one resume
- If you don't see a collection, it means no data has been inserted yet
- After analyzing a resume, all 6 collections will be created/updated

## Viewing Collections in MongoDB Compass

1. **Connect to:** `mongodb://localhost:27017`
2. **Select database:** `resume-analyzer`
3. **Refresh** if collections don't appear (F5 or refresh button)
4. **Click on collection name** to view documents

## Collection Naming

MongoDB automatically pluralizes model names:
- `User` model → `users` collection
- `Resume` model → `resumes` collection
- `AnalysisLog` model → `analysislogs` collection
- `SkillSnapshot` model → `skillsnapshots` collection
- `RecommendationSet` model → `recommendationsets` collection
- `UserActivity` model → `useractivities` collection

## Checking Collections

Run this command to check all collections:
```bash
node check-collections.js
```

## Current Status

Based on the last check:
- ✅ All 6 collections exist
- ✅ Collections contain data from previous analyses
- ✅ Collections are properly linked via ObjectId references

