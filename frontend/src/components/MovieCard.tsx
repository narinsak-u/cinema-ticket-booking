interface MovieCardProps {
  title: string
  description: string
  genre: string
  onClick: () => void
}

export function MovieCard({ title, description, genre, onClick }: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
    >
      <h3>{title}</h3>
      <p style={{ color: '#6b7280', fontSize: 14 }}>{description}</p>
      <span style={{ fontSize: 12, color: '#3b82f6' }}>{genre}</span>
    </div>
  )
}
