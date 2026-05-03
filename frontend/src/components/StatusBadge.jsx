import clsx from 'clsx'

const statusConfig = {
  TODO: { label: 'To Do', className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

const priorityConfig = {
  LOW: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
}

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={clsx('badge', config.className)}>
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={clsx('badge', config.className)}>
      {config.label}
    </span>
  )
}
