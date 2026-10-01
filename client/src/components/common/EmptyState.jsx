export default function EmptyState({ icon = '📋', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="text-muted">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
