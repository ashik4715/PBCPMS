interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: string;
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-stone-200 dark:border-gray-800">
      <div className="flex items-center">
        {icon && <span className="text-2xl mr-4">{icon}</span>}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}