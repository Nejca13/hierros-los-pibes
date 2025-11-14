import Image from 'next/image'

const ImageAndName = ({ image, name }) => {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '190px',
      }}
      title={name}
    >
      <Image
        src={image}
        width={35}
        height={35}
        alt={name}
        style={{ borderRadius: '8px', objectFit: 'cover' }}
      />
      <span
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'inline-block',
        }}
      >
        {name}
      </span>
    </span>
  )
}

export default ImageAndName
