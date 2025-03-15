
import jordan from "../assets/jordan.jpeg";
import StarsRatings from "./Stars";
const RecommendedDesign = () => {
  return (
    <div className='w-[270px] rounded overflow-hidden shadow-lg p-4 bg-white'>
      <div className='h-[45vh]'>
        <img
          src={jordan}
          alt='single_product_image'
          className='w-full h-full object-cover rounded-sm'
        />
      </div>
      <div className='flex justify-between items-center mb-2 w-full mt-6'>
        <div className='flex '>
          <StarsRatings
            rate={5}
            filledStar='text-[17px] mobile:text-[1.1rem] bg-opacity-15 ipad:text-[1.1rem]'
            emptyStar='text-[17px] mobile:text-[1.1rem] ipad:text-[1.1rem]'
          />
        </div>
      </div>
      <div className='font-bold text-xl mb-2'>Thermometer Gun</div>
      <div className='flex items-center mb-4'>
        <span className='text-gray-900 font-bold text-2xl'>$62.00</span>
        <span className='text-gray-500 text-sm line-through ml-2'>$85.00</span>
      </div>
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
        Add to Cart
      </button>
    </div>
  );
};

export default RecommendedDesign;
