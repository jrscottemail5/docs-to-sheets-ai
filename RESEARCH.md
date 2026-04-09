# Research Findings: Docs to Sheets AI Architecture

## Google Docs API

**Key Capabilities:**
- The Google Docs API allows reading document content through the REST API
- Documents are accessed via a unique `documentId` extracted from the document URL
- The API returns document structure including paragraphs, text runs, and formatting
- The `Body` element contains the main content of the document
- Text content is accessed through the document's content structure with `startIndex` and `endIndex` properties

**For Reading Paragraphs:**
- The API provides access to all paragraphs in a document's body
- Each paragraph contains text runs that can be extracted
- The document structure is hierarchical (Body > Paragraph > TextRun)

**Authentication:**
- Uses OAuth 2.0 for user authentication
- Requires `https://www.googleapis.com/auth/documents.readonly` scope to read documents

## Google Sheets API

**Key Capabilities:**
- RESTful interface for reading and writing spreadsheet data
- Can create new spreadsheets and write to existing ones
- Supports A1 notation for cell references (e.g., `Sheet1!A1:B2`)
- Can read and write cell values in batch operations
- Supports multiple sheets within a single spreadsheet

**For Writing Data:**
- Use the `values.append()` method to add rows to a sheet
- Use the `values.update()` method to modify existing cells
- Batch operations available for efficiency

**Authentication:**
- Uses OAuth 2.0 for user authentication
- Requires `https://www.googleapis.com/auth/spreadsheets` scope to write to sheets

## AI Parsing Strategy

**Using OpenAI API:**
- The OpenAI API can be used for text parsing and structured data extraction
- GPT models can parse paragraphs and extract key information
- JSON output mode ensures consistent, structured responses
- The API supports function calling for structured outputs

**Parsing Approach:**
1. Extract all paragraphs from the Google Doc
2. Send paragraphs to OpenAI with a prompt defining the desired structure
3. OpenAI returns parsed data in JSON format
4. Map parsed fields to spreadsheet columns
5. Write mapped data to Google Sheets

## Backend Implementation

**Server-Side Processing:**
- The backend server (Node.js/Express) will handle:
  - OAuth token management and refresh
  - Google Docs API calls to fetch document content
  - OpenAI API calls for text parsing
  - Google Sheets API calls to write data
  - Session management for authenticated users

**Why Backend?**
- API keys (Google Cloud, OpenAI) must be kept secure on the backend
- OAuth token refresh should happen server-side
- Rate limiting and error handling centralized
- Mobile app communicates with backend via REST API

## Data Flow

1. **Mobile App** → User selects Google Doc
2. **Mobile App** → Sends request to backend with document ID
3. **Backend** → Fetches document content from Google Docs API
4. **Backend** → Sends paragraphs to OpenAI for parsing
5. **Backend** → Returns parsed data to mobile app
6. **Mobile App** → User reviews and configures field mapping
7. **Mobile App** → Sends export request with mapping to backend
8. **Backend** → Writes mapped data to Google Sheets API
9. **Backend** → Returns success confirmation to mobile app

## Required Integrations

1. **Google OAuth** - User authentication
2. **Google Docs API** - Read document content
3. **Google Sheets API** - Write to spreadsheets
4. **OpenAI API** - Parse text into structured data
5. **AsyncStorage** - Store recent conversions locally
6. **SecureStore** - Store OAuth tokens securely

## Environment Variables Needed

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_DRIVE_API_KEY` - Google Drive API key (optional, for listing docs)
