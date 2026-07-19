import { z } from 'zod';

export const expenseFormSchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid ISO date (YYYY-MM-DD).'),
  time: z.string().trim().optional().or(z.literal('')),
  category: z.string().trim().min(1, 'Category is required.').max(80, 'Category must be 80 characters or fewer.'),
  amount: z.coerce.number().finite('Enter a valid amount.').positive('Amount must be greater than zero.'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer.').optional().or(z.literal('')),
  paymentMethod: z.string().trim().optional().or(z.literal('')),
  currency: z.string().trim().min(1, 'Currency is required.'),
  tags: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().max(2000, 'Notes must be 2,000 characters or fewer.').optional().or(z.literal(''))
});

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;