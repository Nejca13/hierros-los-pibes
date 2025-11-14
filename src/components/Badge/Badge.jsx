const Badge = ({ children, bg = '#e5e7eb', color = 'white', onClick }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    padding: '2px 8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: bg,
    color: color,
    cursor: onClick ? 'pointer' : 'initial',
  }

  return (
    <span style={baseStyle} onClick={onClick}>
      {children}
    </span>
  )
}

export default Badge
