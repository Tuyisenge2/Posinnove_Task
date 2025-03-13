interface ImageProps {
	idx: number;
	image: string;
}

const ProductImageCard = ({ idx, image }: ImageProps) => {
	return (
		<div key={idx} className="other_images w-full h-32 p-4 gap-4">
			<img
				src={image}
				alt="single_product_image"
				className="w-full h-full object-cover rounded-lg"
				aria-label="imags"
			/>
		</div>
	);
};

export default ProductImageCard;
