import { IoStarOutline } from 'react-icons/io5';
import { IoStar } from 'react-icons/io5';

interface starsRatingType {
	rate?: number;
	emptyStar?: string;
	filledStar?: string;
}
function StarsRatings(props: starsRatingType) {
	const totolStars = 5;
	return (
		<span className="ratings flex gap-1">
			{[...Array(totolStars)].map((_, index) =>
				index < (props?.rate || 0) ? (
					<IoStar key={index} className={props.filledStar} color="#006bb3" />
				) : (
					<IoStarOutline key={index} className={props.emptyStar} color="" />
				),
			)}
		</span>
	);
}
export default StarsRatings;
