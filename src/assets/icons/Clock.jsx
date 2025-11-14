const Clock = ({
  width = '24px',
  height = '24px',
  color = 'var(--marron)',
}) => {
  return (
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
      className='lucide lucide-clock h-4 w-4 ml-3 mr-1'
    >
      <circle cx={12} cy={12} r={10} />
      <polyline points='12 6 12 12 16 14' />
    </svg>
  )
}

export default Clock
