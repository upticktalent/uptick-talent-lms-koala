import { buildCalendar, CalendarEventOptions } from "simple-ics-calendar";

export interface InterviewCalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  description?: string;
  meetingLink?: string;
  organizerName?: string;
  organizerEmail?: string;
  attendeeName?: string;
  attendeeEmail?: string;
}

export class CalendarService {
  /**
   * Generate ICS calendar event for interview
   */
  static generateInterviewICS(event: InterviewCalendarEvent): string {
    const {
      title,
      startDate,
      endDate,
      location,
      description,
      meetingLink,
      organizerName,
      organizerEmail,
      attendeeName,
      attendeeEmail,
    } = event;

    // Build description with meeting details
    let eventDescription = description || "";
    if (meetingLink) {
      eventDescription += `\n\nJoin Meeting: ${meetingLink}`;
    }
    if (location && location !== "Online") {
      eventDescription += `\nLocation: ${location}`;
    }

    const calendarOptions: CalendarEventOptions = {
      title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      isUtc: true,
      location: location || "Online",
      description: eventDescription.trim(),
      url: meetingLink,
    };

    // Add organizer if provided
    if (organizerName && organizerEmail) {
      calendarOptions.organizer = {
        name: organizerName,
        email: organizerEmail,
      };
    }

    // Add attendee if provided
    if (attendeeName && attendeeEmail) {
      calendarOptions.attendees = [
        {
          name: attendeeName,
          email: attendeeEmail,
          role: "REQ-PARTICIPANT",
        },
      ];
    }

    return buildCalendar(calendarOptions);
  }

  /**
   * Generate ICS for applicant (they are the attendee)
   */
  static generateApplicantInterviewICS(
    applicantName: string,
    applicantEmail: string,
    interviewerName: string,
    interviewerEmail: string,
    trackName: string,
    startDate: Date,
    duration: number = 30,
    location: string = "Online",
    meetingLink?: string,
  ): string {
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    return this.generateInterviewICS({
      title: `Interview - ${trackName}`,
      startDate,
      endDate,
      location,
      description: `Interview for ${trackName} program.\n\nInterviewer: ${interviewerName}`,
      meetingLink,
      organizerName: interviewerName,
      organizerEmail: interviewerEmail,
      attendeeName: applicantName,
      attendeeEmail: applicantEmail,
    });
  }

  /**
   * Generate ICS for interviewer (they are the organizer)
   */
  static generateInterviewerInterviewICS(
    interviewerName: string,
    interviewerEmail: string,
    applicantName: string,
    applicantEmail: string,
    trackName: string,
    startDate: Date,
    duration: number = 30,
    location: string = "Online",
    meetingLink?: string,
  ): string {
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    return this.generateInterviewICS({
      title: `Interview - ${applicantName} (${trackName})`,
      startDate,
      endDate,
      location,
      description: `Interview with ${applicantName} for ${trackName} program.`,
      meetingLink,
      organizerName: interviewerName,
      organizerEmail: interviewerEmail,
      attendeeName: applicantName,
      attendeeEmail: applicantEmail,
    });
  }

  /**
   * Generate ICS for interview reminder
   */
  static generateInterviewReminderICS(
    applicantName: string,
    applicantEmail: string,
    interviewerName: string,
    interviewerEmail: string,
    trackName: string,
    startDate: Date,
    duration: number = 30,
    location: string = "Online",
    meetingLink?: string,
  ): string {
    // Same as applicant ICS but with reminder title
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    return this.generateInterviewICS({
      title: `REMINDER: Interview - ${trackName}`,
      startDate,
      endDate,
      location,
      description: `Reminder: Interview for ${trackName} program.\n\nInterviewer: ${interviewerName}`,
      meetingLink,
      organizerName: interviewerName,
      organizerEmail: interviewerEmail,
      attendeeName: applicantName,
      attendeeEmail: applicantEmail,
    });
  }

  /**
   * Generate Buffer from ICS string for email attachment
   */
  static generateICSBuffer(icsString: string): Buffer {
    return Buffer.from(icsString, "utf8");
  }

  /**
   * Generate attachment object for email service
   */
  static generateICSAttachment(
    icsString: string,
    filename: string = "interview.ics",
  ): { filename: string; content: Buffer; contentType: string } {
    return {
      filename,
      content: this.generateICSBuffer(icsString),
      contentType: "text/calendar",
    };
  }
}
