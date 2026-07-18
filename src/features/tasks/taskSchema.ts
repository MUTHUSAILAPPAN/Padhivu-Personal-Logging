import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required.').max(150, 'Task title must be 150 characters or fewer.'),
  description: z.string().trim().max(2000, 'Description must be 2,000 characters or fewer.').default(''),
  status: z.string().trim().default('Not Started'),
  priority: z.string().trim().default('Medium'),
  dueDate: z.string().trim().default(''),
  tags: z.string().trim().default('')
});

export type TaskFormValues = z.input<typeof taskFormSchema>;