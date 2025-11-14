const LuUser = ({
  width = '24',
  height = '24',
  color = 'var(--marron)',
  className = '',
}) => (
  <svg
    stroke={color}
    fill='none'
    strokeWidth='2'
    viewBox='0 0 24 24'
    strokeLinecap='round'
    strokeLinejoin='round'
    height={height}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <circle cx='12' cy='8' r='5'></circle>
    <path d='M20 21a8 8 0 0 0-16 0'></path>
  </svg>
)

export default LuUser
