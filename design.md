# Docs to Sheets AI - Mobile App Design

## Overview
A mobile app that automates the extraction of text from Google Docs and converts it into structured data in Google Sheets using AI parsing.

## Screen List

1. **Home Screen** - Main entry point with quick actions
2. **Google Auth Screen** - OAuth login for Google services
3. **Document Selection Screen** - Browse and select Google Docs
4. **Preview Screen** - Display extracted text and AI-parsed data
5. **Mapping Configuration Screen** - Configure how paragraphs map to spreadsheet columns
6. **Export Screen** - Select target Google Sheet and execute export
7. **Settings Screen** - App preferences and account management

## Primary Content and Functionality

### Home Screen
- **Content**: Welcome message, quick action buttons, recent documents list
- **Functionality**: 
  - "New Conversion" button → navigates to Document Selection
  - "Recent Conversions" list showing past operations
  - "Settings" button → navigates to Settings

### Google Auth Screen
- **Content**: Google OAuth login flow
- **Functionality**:
  - Authenticate with Google account
  - Request permissions for Google Docs and Sheets access
  - Store OAuth token securely

### Document Selection Screen
- **Content**: List of user's Google Docs with search/filter
- **Functionality**:
  - Display paginated list of Google Docs
  - Search by document name
  - Select a document to proceed
  - Show document preview (first 100 characters)

### Preview Screen
- **Content**: 
  - Original text from Google Doc (paragraphs)
  - AI-parsed structured data (preview)
  - Loading indicator during AI processing
- **Functionality**:
  - Display raw paragraphs from selected Google Doc
  - Call AI to parse paragraphs into structured format
  - Show preview of parsed data before export
  - Option to manually edit parsed data
  - "Next" button to proceed to mapping configuration

### Mapping Configuration Screen
- **Content**:
  - Detected data fields (from AI parsing)
  - Column headers for target Google Sheet
  - Mapping interface (drag-and-drop or dropdown)
- **Functionality**:
  - Display AI-detected fields
  - Allow user to map fields to spreadsheet columns
  - Add custom column headers
  - Preview mapped data structure
  - "Export" button to proceed

### Export Screen
- **Content**:
  - List of user's Google Sheets
  - Option to create new sheet
  - Export progress indicator
- **Functionality**:
  - Select existing Google Sheet or create new one
  - Select target worksheet within the sheet
  - Execute export operation
  - Show success/error message
  - Option to open exported sheet or return to home

### Settings Screen
- **Content**:
  - Account info (logged-in user email)
  - App preferences (AI model selection, parsing strictness)
  - About section
- **Functionality**:
  - Display current Google account
  - Logout button
  - Toggle AI parsing options
  - View app version and privacy policy

## Key User Flows

### Main Conversion Flow
1. User taps "New Conversion" on Home Screen
2. Authenticates with Google (if not already logged in)
3. Selects a Google Doc from Document Selection Screen
4. System fetches and displays doc text on Preview Screen
5. AI parses paragraphs into structured data
6. User reviews preview and proceeds to Mapping Configuration
7. User maps AI-detected fields to spreadsheet columns
8. User selects target Google Sheet on Export Screen
9. System writes data to Google Sheet
10. Success confirmation shown; user can open sheet or return to home

### Re-run Previous Conversion
1. User taps a recent conversion from Home Screen
2. System loads previous configuration (doc, mapping, target sheet)
3. User can modify settings or proceed directly to export
4. Data is re-exported to the same or different sheet

## Color Choices

| Element | Color | Usage |
|---------|-------|-------|
| Primary | `#4285F4` (Google Blue) | Buttons, highlights, active states |
| Background | `#FFFFFF` (Light) / `#121212` (Dark) | Screen backgrounds |
| Surface | `#F8F9FA` (Light) / `#1E1E1E` (Dark) | Cards, input fields |
| Text Primary | `#202124` (Light) / `#E8EAED` (Dark) | Main text |
| Text Secondary | `#5F6368` (Light) / `#9AA0A6` (Dark) | Secondary text |
| Success | `#34A853` (Google Green) | Success messages, checkmarks |
| Warning | `#FBBC04` (Google Yellow) | Warning messages |
| Error | `#EA4335` (Google Red) | Error messages, validation |
| Border | `#DADCE0` (Light) / `#3C4043` (Dark) | Dividers, borders |

## Design Principles

- **Mobile-First**: All layouts assume portrait orientation (9:16) and one-handed usage
- **Google Branding**: Use Google's color palette and design language for familiarity
- **Progressive Disclosure**: Show only necessary information at each step
- **Feedback**: Provide clear feedback for all user actions (loading, success, errors)
- **Accessibility**: Ensure sufficient contrast, readable font sizes, and touch targets
- **iOS-First**: Follow Apple Human Interface Guidelines for native feel
