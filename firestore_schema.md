# Firestore Database Schema

## Users Collection (`users`)
- `uid` (string): Firebase Auth UID
- `name` (string): Full Name
- `email` (string): Email Address
- `college` (string): Selected College Name
- `branch` (string): Selected Branch (CSE, ECE, etc.)
- `semester` (string): Current Semester (1-8)
- `savedNotes` (array of strings): IDs of saved material
- `createdAt` (timestamp)

## Colleges Collection (`colleges`)
- `id` (string): Auto-generated
- `name` (string): College Name
- `location` (string): City/Address
- `website` (string): Official Website URL

## Materials Collection (`materials`)
- `id` (string): Auto-generated
- `type` (string): 'note' | 'pyq' | 'syllabus'
- `title` (string): Title of the material
- `subject` (string): Subject Name
- `branch` (string): Target Branch
- `semester` (string): Target Semester
- `fileUrl` (string): Firebase Storage URL
- `uploadedBy` (string): Admin/User ID
- `timestamp` (timestamp)

## Notices Collection (`notices`)
- `id` (string): Auto-generated
- `title` (string): Notice Title
- `body` (string): Content
- `date` (timestamp): Date of notice
- `category` (string): 'exam' | 'holiday' | 'general'
- `link` (string): Optional external link

## Posts Collection (`posts`)
- `id` (string): Auto-generated
- `authorId` (string): User UID
- `authorName` (string): User Name
- `content` (string): Post content
- `collegeId` (string): Optional (for college-specific boards)
- `likes` (number): Count
- `commentsCount` (number): Count
- `timestamp` (timestamp)
