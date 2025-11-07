# Brevo Email Service - Technical Documentation

## Overview

The `BrevoEmailService` is a comprehensive email management system that provides
dynamic template-based email sending with Brevo integration. It handles
personalization, logging, error tracking, and maintains backward compatibility
with existing email methods.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controllers   │    │  Email Service   │    │  Brevo API      │
│                 │    │                  │    │                 │
│ • Application   │───▶│ • Template Mgmt  │───▶│ • Send Email    │
│ • Assessment    │    │ • Variable Proc  │    │ • Track Status  │
│ • User Mgmt     │    │ • Data Enrichment│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Database      │    │  Email Logs      │
│                 │    │                  │
│ • Users         │    │ • Delivery Status│
│ • Applications  │    │ • Error Tracking │
│ • Templates     │    │ • Audit Trail    │
└─────────────────┘    └──────────────────┘
```

## Core Components

### 1. BrevoEmailService Class

#### Constructor

```typescript
constructor() {
  // Initialize Brevo API client
  this.apiInstance = new brevo.TransactionalEmailsApi();

  // Set API key from environment variables
  this.apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY || ""
  );
}
```

**Purpose**: Initializes the Brevo API client with authentication credentials.

**Environment Variables Required**:

- `BREVO_API_KEY`: Your Brevo (formerly Sendinblue) API key
- `APP_NAME`: Application name for sender identity
- `SENDER_EMAIL`: Default sender email address
- `SUPPORT_EMAIL`: Support team email for templates
- `FRONTEND_URL`: Platform URL for login links

### 2. Template Management

#### `getTemplate(templateType?, templateId?)`

```typescript
async getTemplate(templateType?: string, templateId?: string): Promise<IEmailTemplate | null>
```

**Purpose**: Retrieves email templates from the database.

**Logic Flow**:

1. If `templateId` provided → Find by ID
2. If `templateType` provided → Find active template of that type
3. Only one active template per type is allowed (enforced by model middleware)

**Template Types**:

- `application_confirmation` - Application received
- `application_acceptance` - Application accepted with credentials
- `application_rejection` - Application rejected with feedback
- `assessment_invitation` - Assessment invitation for shortlisted candidates
- `assessment_confirmation` - Assessment submission confirmation
- `assessment_review` - Assessment review complete notification
- `welcome_email` - New user/mentor welcome
- `custom` - Custom templates for campaigns

### 3. Variable Processing System

#### `replaceVariables(content, variables)`

```typescript
private replaceVariables(content: string, variables: EmailVariables): string
```

**Purpose**: Processes template content and replaces variable placeholders with
actual data.

**Process**:

1. Iterates through all provided variables
2. Uses regex pattern `{{\\s*${key}\\s*}}` to find placeholders
3. Replaces with actual values, converting to strings
4. Handles whitespace around variable names

**Variable Syntax**: `{{variableName}}` or `{{ variableName }}`

#### `getRecipientData(recipientId, recipientType)`

```typescript
async getRecipientData(recipientId: string, recipientType: string): Promise<EmailVariables>
```

**Purpose**: Enriches email data with recipient-specific information from the
database.

**Base Data (Always Available)**:

```typescript
{
  currentDate: "11/5/2025",
  currentTime: "10:30:45 AM",
  platformName: "Uptick Talent",
  supportEmail: "support@upticktalent.com",
  loginUrl: "https://platform.upticktalent.com"
}
```

**User Data (recipientType: "user")**:

```typescript
// Fetches from User model
{
  ...baseData,
  recipientName: "John Doe",
  recipientEmail: "john@example.com",
  recipientRole: "mentor"
}
```

**Applicant Data (recipientType: "applicant")**:

```typescript
// Fetches from Application model with populated references
{
  ...baseData,
  applicantName: "Jane Smith",
  applicantEmail: "jane@example.com",
  cohortName: "Full Stack Development 2024",
  trackName: "Frontend Development",
  applicationId: "67890",
  applicationStatus: "pending",
  applicationDate: "10/15/2024"
}
```

**Database Queries**:

- **User**: `User.findById(recipientId)`
- **Applicant**:
  `Application.findById(recipientId).populate("applicant", "firstName lastName email").populate("cohort", "name").populate("track", "name")`

### 4. Email Sending Process

#### `sendTemplatedEmail(options)`

```typescript
async sendTemplatedEmail(options: SendEmailOptions): Promise<boolean>
```

**Complete Process Flow**:

```
1. Template Retrieval
   ├── Get template by ID or type
   └── Validate template exists

2. Data Enrichment
   ├── Fetch recipient data from database
   ├── Merge with custom variables
   └── Set final variable context

3. Content Processing
   ├── Process subject line
   ├── Process HTML content
   └── Process text content (optional)

4. Email Logging (Pre-send)
   ├── Create EmailLog entry
   ├── Status: "pending"
   └── Store all email details

5. Brevo API Call
   ├── Format email object
   ├── Send via Brevo
   └── Handle response

6. Email Logging (Post-send)
   ├── Update status: "sent" or "failed"
   ├── Store sent timestamp
   └── Log any errors
```

**Variable Precedence** (highest to lowest):

1. Custom variables (`options.variables`)
2. Recipient data from database
3. Base system variables
4. Explicit recipient properties (`options.recipient.name`)

**Example Variable Merging**:

```typescript
const allVariables = {
  // Base data
  currentDate: "11/5/2025",
  platformName: "Uptick Talent",

  // From database (applicant data)
  applicantName: "John Doe",
  cohortName: "Full Stack 2024",

  // Custom variables (highest priority)
  specialMessage: "Welcome bonus included!",

  // Explicit recipient data
  recipientName: options.recipient.name || "John Doe",
  recipientEmail: "john@example.com",
};
```

### 5. Email Logging System

#### EmailLog Model Structure

```typescript
interface IEmailLog {
  campaignId?: ObjectId; // For bulk campaigns
  templateId: ObjectId; // Template used
  recipientEmail: string; // Recipient email
  recipientName?: string; // Recipient name
  recipientId?: ObjectId; // User/Application ID
  recipientType?: "user" | "applicant" | "external";
  subject: string; // Processed subject
  htmlContent: string; // Processed HTML
  textContent?: string; // Processed text
  status: "pending" | "sent" | "failed" | "bounced";
  errorMessage?: string; // Error details
  sentAt?: Date; // Delivery timestamp
  openedAt?: Date; // Email opened (future feature)
  clickedAt?: Date; // Link clicked (future feature)
  metadata?: {
    // Context data
    cohortId?: ObjectId;
    applicationId?: ObjectId;
    trackId?: ObjectId;
  };
}
```

#### Logging Process

1. **Pre-send**: Create log entry with status "pending"
2. **Success**: Update status to "sent" with timestamp
3. **Failure**: Update status to "failed" with error message
4. **Retry Logic**: Find pending emails for error updates

### 6. Backward Compatibility Methods

The service maintains all existing email methods for seamless migration:

#### Application Emails

```typescript
// Application received confirmation
sendApplicationConfirmation(email, name, cohort, applicationId?)

// Application accepted with credentials
sendAcceptanceEmail(email, name, cohort, password, applicationId?)

// Application rejected with reason
sendRejectionEmail(email, name, cohort, reason?, applicationId?)
```

#### Assessment Emails

```typescript
// Assessment invitation for shortlisted candidates
sendAssessmentEmail(email, name, cohort, assessmentLink, applicationId?)

// Assessment submission confirmation
sendAssessmentConfirmation(email, name, track, submissionType, applicationId?)

// Assessment review completion
sendAssessmentReviewNotification(email, name, track, status, score?, applicationId?)
```

#### User Management Emails

```typescript
// Welcome email for new users/mentors
sendWelcomeEmail(email, name, role, password, assignedTracks?, userId?)
```

**Internal Conversion**: Each method converts parameters to
`sendTemplatedEmail()` format:

```typescript
async sendApplicationConfirmation(email, name, cohort, applicationId?) {
  await this.sendTemplatedEmail({
    templateType: "application_confirmation",
    recipient: { email, name, id: applicationId, type: "applicant" },
    variables: { cohortName: cohort },
    metadata: { applicationId }
  });
}
```

## Error Handling

### 1. Template Errors

- **Missing Template**: Returns `null`, logs error
- **Invalid Template ID**: Database validation error
- **Inactive Template**: No active template found for type

### 2. Data Enrichment Errors

- **Invalid Recipient ID**: Returns base data only
- **Database Connection**: Fallback to base variables
- **Missing References**: Graceful degradation with empty strings

### 3. Email Sending Errors

- **Brevo API Errors**: Logged with full error details
- **Invalid Email**: Validation before sending
- **Network Issues**: Retry logic (future enhancement)

### 4. Logging Errors

- **Database Issues**: Continue email sending, log separately
- **Disk Space**: Graceful degradation
- **Concurrent Updates**: Handled by MongoDB atomic operations

## Performance Considerations

### 1. Database Optimization

- **Indexes**: Template type, recipient email, status, dates
- **Population**: Only fetch required fields
- **Lean Queries**: Use `.lean()` for read-only operations

### 2. Memory Management

- **Template Caching**: Future enhancement for frequently used templates
- **Variable Processing**: Efficient string replacement
- **Garbage Collection**: Proper cleanup of large email content

### 3. Rate Limiting

- **Brevo Limits**: Built-in API rate limiting
- **Bulk Sends**: Queue system for large campaigns (future)
- **Error Backoff**: Exponential backoff for failed sends

## Security Features

### 1. Data Protection

- **Email Validation**: Strict email format validation
- **Content Sanitization**: Safe variable replacement
- **Access Control**: Role-based template management

### 2. API Security

- **API Key Management**: Environment variable storage
- **Request Signing**: Brevo handles authentication
- **Error Masking**: No sensitive data in logs

### 3. Audit Trail

- **Complete Logging**: Every email tracked
- **Status Tracking**: Delivery confirmation
- **Error Documentation**: Full error context

## Integration Points

### 1. Application System

```typescript
// When application is submitted
await brevoEmailService.sendApplicationConfirmation(
  application.email,
  application.fullName,
  cohort.name,
  application._id,
);
```

### 2. Assessment System

```typescript
// When assessment is reviewed
await brevoEmailService.sendAssessmentReviewNotification(
  applicant.email,
  applicant.fullName,
  track.name,
  "reviewed",
  85,
  application._id,
);
```

### 3. User Management

```typescript
// When mentor is created
await brevoEmailService.sendWelcomeEmail(
  mentor.email,
  mentor.fullName,
  "mentor",
  tempPassword,
  assignedTracks.join(", "),
  mentor._id,
);
```

## Configuration

### Environment Variables

```env
# Brevo Configuration
BREVO_API_KEY=your_brevo_api_key_here
SENDER_EMAIL=noreply@upticktalent.com
SUPPORT_EMAIL=support@upticktalent.com

# Application Configuration
APP_NAME=Uptick Talent
FRONTEND_URL=https://platform.upticktalent.com

# Development Overrides
NODE_ENV=development
```

### Template Variables Reference

```typescript
// Always Available
currentDate, currentTime, platformName, supportEmail, loginUrl

// User Context (recipientType: "user")
recipientName, recipientEmail, recipientRole, userRole

// Applicant Context (recipientType: "applicant")
applicantName, applicantEmail, cohortName, trackName,
applicationId, applicationStatus, applicationDate

// Authentication
temporaryPassword

// Assessment Context
assessmentLink, submissionType, reviewStatus, score

// Custom Context
rejectionReason, assignedTracks, specialMessage, etc.
```

## Migration Guide

### From Legacy Email Service

1. **Keep Existing Calls**: All methods work unchanged
2. **Add Template Support**: Create templates for custom emails
3. **Enhanced Logging**: Automatic audit trail
4. **Better Personalization**: Rich variable system

### Template Creation

1. **Create Template**: Use frontend template editor
2. **Add Variables**: Use variable picker for dynamic content
3. **Test Template**: Send test emails before activation
4. **Activate Template**: Set as active for automatic use

This technical documentation provides a complete understanding of how the Brevo
email service operates, from initialization through delivery and logging. The
system is designed for reliability, scalability, and maintainability while
providing rich personalization capabilities.
