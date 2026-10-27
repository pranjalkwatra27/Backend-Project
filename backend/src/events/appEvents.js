import { EventEmitter } from 'events';

// Custom Application EventEmitter demonstrating Node.js Events & EventEmitter syllabus
class ApplicationEventEmitter extends EventEmitter {}

export const appEvents = new ApplicationEventEmitter();

// Event Listener: Application Submitted
appEvents.on('application:submitted', (data) => {
  const { applicationId, candidateName, jobTitle, companyName } = data;
  console.log(`[Event: application:submitted] Candidate "${candidateName}" applied for "${jobTitle}" at ${companyName} (AppID: ${applicationId})`);
  // Simulates email notification trigger to recruiter
});

// Event Listener: Application Stage Changed
appEvents.on('application:stageChanged', (data) => {
  const { applicationId, candidateEmail, jobTitle, oldStage, newStage } = data;
  console.log(`[Event: application:stageChanged] Status updated from "${oldStage}" to "${newStage}" for job "${jobTitle}". Notification queued for: ${candidateEmail}`);
});

// Event Listener: Job Status Updated
appEvents.on('job:statusUpdated', (data) => {
  const { jobId, title, status } = data;
  console.log(`[Event: job:statusUpdated] Job "${title}" (ID: ${jobId}) marked as "${status}"`);
});
