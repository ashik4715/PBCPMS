interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  USED: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}