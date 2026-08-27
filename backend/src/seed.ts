import { v4 as uuidv4 } from 'uuid';
import { taskRepository } from './modules/tasks/task.repository';
import { TaskPriority, TaskStatus } from './modules/tasks/task.types';

export function seedIfEmpty(): void {
  const existing = taskRepository.findAll({ limit: 1, offset: 0 });
  if (existing.total > 0) return;

  const samples = [
    { title: 'Missing customer document', description: 'The customer submitted their application but has not provided their latest payslip.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Update billing address', description: 'Customer requested an update to their billing address on file.', priority: TaskPriority.LOW, status: TaskStatus.IN_PROGRESS },
    { title: 'Login issue reported', description: 'Customer is unable to log into their account after a password reset.', priority: TaskPriority.MEDIUM, status: TaskStatus.NEW },
    { title: 'Duplicate invoice detected', description: 'Two identical invoices were charged to the same account; verify and refund the duplicate.', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS },
    { title: 'Verify KYC documents', description: 'Identity documents uploaded by the customer need manual review before the account can be activated.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Card payment declined', description: 'The customer reported that their card payment was declined despite sufficient funds being available.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Refund request', description: 'Customer is requesting a refund for an order placed in error last week.', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS },
    { title: 'Change contact email', description: 'Customer would like to update the contact email associated with their account.', priority: TaskPriority.LOW, status: TaskStatus.COMPLETED },
    { title: 'Account locked out', description: 'Customer is locked out of their account after too many failed login attempts.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Update phone number', description: 'Customer provided a new phone number and requested it be updated on their profile.', priority: TaskPriority.LOW, status: TaskStatus.IN_PROGRESS },
    { title: 'Missing invoice', description: 'Customer states they never received the invoice for last month. Resend the invoice.', priority: TaskPriority.MEDIUM, status: TaskStatus.NEW },
    { title: 'Statement request', description: 'Customer requested a copy of their transaction statement for the last quarter.', priority: TaskPriority.LOW, status: TaskStatus.COMPLETED },
    { title: 'Fraud alert review', description: 'An account flagged a suspicious transaction; review and confirm with the customer.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Password change request', description: 'Customer wants to reset their password for a different account than the one used.', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS },
    { title: 'Add authorised user', description: 'Customer requested to add an authorised user to their joint account.', priority: TaskPriority.LOW, status: TaskStatus.NEW },
    { title: 'Fee dispute', description: 'Customer is disputing a service fee they believe was charged incorrectly.', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS },
    { title: 'Reactivate account', description: 'Customer would like to reactivate an account that was previously closed.', priority: TaskPriority.MEDIUM, status: TaskStatus.NEW },
    { title: 'Verify new device', description: 'A login from an unrecognised device needs verification to authorise access.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Update beneficiary details', description: 'Customer needs to correct the beneficiary details on a scheduled transfer.', priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED },
    { title: 'Close account request', description: 'Customer requested to close their account and confirm no outstanding balance.', priority: TaskPriority.LOW, status: TaskStatus.NEW },
    { title: 'Unauthorised transaction reported', description: 'Customer noticed a transaction on their statement they do not recognise and wants it investigated.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Update mailing address', description: 'Customer moved and needs their mailing address updated for future correspondence.', priority: TaskPriority.LOW, status: TaskStatus.COMPLETED },
    { title: 'Overdraft limit increase', description: 'Customer has requested a temporary increase to their overdraft limit.', priority: TaskPriority.MEDIUM, status: TaskStatus.NEW },
    { title: 'App crashing on login', description: 'Customer reports the mobile app crashes every time they try to log in.', priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS },
    { title: 'Standing order not processed', description: 'A scheduled standing order failed to process on the expected date.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Update employment details', description: 'Customer would like to update their employment information on file.', priority: TaskPriority.LOW, status: TaskStatus.IN_PROGRESS },
    { title: 'Joint account setup', description: 'Customer wants to convert their individual account into a joint account.', priority: TaskPriority.MEDIUM, status: TaskStatus.NEW },
    { title: 'Interest rate query', description: 'Customer is asking for clarification on the interest rate applied to their savings account.', priority: TaskPriority.LOW, status: TaskStatus.COMPLETED },
    { title: 'Debit card not received', description: 'Customer ordered a replacement debit card three weeks ago and has not received it.', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS },
    { title: 'Two-factor authentication issue', description: 'Customer is not receiving the OTP code required to complete login.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Loan application follow-up', description: 'Customer is following up on the status of their pending loan application.', priority: TaskPriority.MEDIUM, status: TaskStatus.NEW },
    { title: 'Update next of kin', description: 'Customer wants to update the next of kin details linked to their account.', priority: TaskPriority.LOW, status: TaskStatus.NEW },
    { title: 'Currency exchange query', description: 'Customer has a question about the exchange rate applied to a recent international transfer.', priority: TaskPriority.LOW, status: TaskStatus.IN_PROGRESS },
    { title: 'Suspicious login attempt', description: 'System flagged multiple failed login attempts from an unfamiliar location.', priority: TaskPriority.HIGH, status: TaskStatus.NEW },
    { title: 'Merge duplicate accounts', description: 'Customer accidentally created two accounts and wants them merged into one.', priority: TaskPriority.MEDIUM, status: TaskStatus.COMPLETED },
  ];

  samples.forEach((sample) => {
    taskRepository.create({
      id: uuidv4(),
      title: sample.title,
      description: sample.description,
      priority: sample.priority,
      status: sample.status,
      createdAt: new Date().toISOString(),
    });
  });
}