const Court = ({
  width = '24px',
  height = '24px',
  color = 'var(--marron)',
  className = '',
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={width}
    height={height}
    viewBox='0 0 24 24'
    fill='none'
    stroke={color}
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className={`lucide lucide-court ${className}`}
  >
    <rect width="18" height="12" x="3" y="6" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="6" x2="12" y2="18" />
  </svg>
)

export default Court