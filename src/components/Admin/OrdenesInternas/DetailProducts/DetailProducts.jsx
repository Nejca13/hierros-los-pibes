import Image from 'next/image'
import styles from './DetailProducts.module.css'

const DetailProducts = ({ selectedProduct }) => {
  return (
    <div className={styles.container}>
      <h2>Productos consumidos</h2>
      <ul className={styles.products_list_container}>
        {selectedProduct.map((product, index) => (
          <li key={index} className={styles.product_item}>
            <Image
              src={product?.image}
              width={30}
              height={30}
              alt={product?.name}
            />
            {product?.name} - ${product?.unit_price}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DetailProducts
