import type { Expense } from '../../../types';
import ExpenseCard from './ExpenseCard';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} onDelete={onDelete} />
      ))}
    </div>
  );
}