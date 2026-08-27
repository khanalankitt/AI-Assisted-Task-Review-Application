import { v4 as uuidv4 } from 'uuid';
import { taskRepository } from './modules/tasks/task.repository';
import { TaskPriority, TaskStatus } from './modules/tasks/task.types';

export function seedIfEmpty(): void {
  const existing = taskRepository.findAll();
  if (existing.length > 0) return;

  const samples = [
    {
      title: 'Missing customer document',
      description:
        'The customer submitted their application but has not provided their latest payslip.',
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Update billing address',
      description: 'Customer requested an update to their billing address on file.',
      priority: TaskPriority.LOW,
    },
    {
      title: 'Login issue reported',
      description: 'Customer is unable to log into their account after a password reset.',
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Duplicate invoice detected',
      description:
        'Two identical invoices were charged to the same account; verify and refund the duplicate.',
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'Verify KYC documents',
      description:
        'Identity documents uploaded by the customer need manual review before the account can be activated.',
      priority: TaskPriority.HIGH,
    },
  ];

  samples.forEach((sample) => {
    taskRepository.create({
      id: uuidv4(),
      title: sample.title,
      description: sample.description,
      priority: sample.priority,
      status: TaskStatus.NEW,
      createdAt: new Date().toISOString(),
    });
  });
}
