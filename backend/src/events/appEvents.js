import { EventEmitter } from 'events';

class ApplicationEventEmitter extends EventEmitter {}

export const appEvents = new ApplicationEventEmitter();

appEvents.on('application:submitted', (data) => {
  const { applicationId, candidateName, jobTitle, companyName } = data;
  console.log(`[Event: application:submitted] Candidate "${candidateName}" applied for "${jobTitle}" at ${companyName} (AppID: ${applicationId})`);
});

appEvents.on('application:stageChanged', (data) => {
  const { applicationId, candidateEmail, jobTitle, oldStage, newStage } = data;
  console.log(`[Event: application:stageChanged] Status updated from "${oldStage}" to "${newStage}" for job "${jobTitle}". Notification queued for: ${candidateEmail}`);
});

appEvents.on('job:statusUpdated', (data) => {
  const { jobId, title, status } = data;
  console.log(`[Event: job:statusUpdated] Job "${title}" (ID: ${jobId}) marked as "${status}"`);
});
