/* eslint-disable @typescript-eslint/no-explicit-any */
//import { FaCartPlus, FaPlus, FaMinus } from 'react-icons/fa';
//import { useEffect, useState } from "react";
import StarsRatings from "./Stars";
import ProductImageCard from "./Productimagecard";
import jordan from "../assets/jordan.jpeg";
import RecommendedDesign from "./Recommended";
import { useState } from "react";
import { FaBalanceScale, FaHeart } from "react-icons/fa";

const ProductComp = () => {
  const [desc, setDesc] = useState(true);
  const [rev, setRev] = useState(false);
  const [cart, setCart] = useState(0);
  const singleProduct = [
    {
      images: [jordan, jordan, jordan],
    },
  ];
  
  const toggleRev = () => {
    setDesc(!desc);
    setRev(!rev);
  };

  return (
    <>
      <div className='w-full h-full  bg-white relative pb-10 laptop:pb-0 '>
        {
          <>
            <div className='relative bg-white w-[98%] mobile:max-w-[80%] m-auto h-full rounded-2xl laptop:mb-[6%]'>
              <div className=' flex flex-col gap-6 pl-[5%] ipad:pl-[6%] laptop:pl-[4%]'>
                <h1 className='text-[2.4rem] font-bold'>Product Details</h1>
                <div className='text-[1rem] font-semibold flex gap-5 '>
                  {" "}
                  <p className='text-blue-700'>Home &gt;</p> Details{" "}
                </div>
              </div>
              <div className='flex flex-col m-auto tablet:flex-row gap-10 p-[5%] ipad:p-[6%] laptop:p-[4%]'>
                <div className='images flex flex-col w-full laptop:w-[50%] gap-4'>
                  <div className='flex w-full h-[50vh]  laptop:h-[50vh] rounded-2xl overflow-hidden '>
                    <img
                      src={jordan}
                      alt='single_product_image'
                      className='w-full h-full object-cover rounded-sm'
                    />
                  </div>

                  <div className='flex gap-1.5'>
                    {singleProduct[0]?.images?.map(
                      (item: string, index: number) => (
                        <ProductImageCard key={index} image={item} idx={0} />
                      )
                    )}
                  </div>
                </div>
                <div className='description flex flex-col flex-1 gap-3 py-6 tablet:py-0 '>
                  <h1 className='text-[20px] font-bold tablet:text-[30px]'>
                    Air Jordan
                  </h1>
                  <div className=' font-semibold text-yellow-400 flex gap-4 items-center'>
                    <h1 className='text-[30px]  text-yellow-400 font-bold'>
                      $3434
                    </h1>
                    <h1 className='text-[20px]  line-through  text-yellow-400'>
                      $343
                    </h1>
                  </div>
                  <div
                    className='w-full border-b border-gray-500
                  '
                  ></div>
                  <div className=' flex gap-4 my-[4px]'>
                    <h1 className=''>Categories:</h1>{" "}
                    <p className='font-bold text-gray-500'>shoes</p>
                  </div>
                  <div
                    className='w-full border-b border-gray-500 mb-6
                  '
                  ></div>
                  <div className=' flex w-full justify-between '>
                    <div className=' flex border w-[45%] justify-between'>
                      <p
                        className='flex-1 flex items-center justify-center border-r hover:cursor-pointer'
                        onClick={() => {
                          if (cart > 0) setCart(cart - 1);
                          else setCart(0);
                        }}
                      >
                        -
                      </p>
                      <p className='flex-1 flex items-center justify-center  border-r'>
                        {cart}
                      </p>
                      <p
                        className='flex-1 flex items-center justify-center  hover:cursor-pointer'
                        onClick={() => setCart(cart + 1)}
                      >
                        +
                      </p>
                    </div>

                    <div className=' flex w-[45%]'>
                      <button
                        onClick={() => setCart(cart + 1)}
                        className='text-white  w-full py-3   hover:cursor-pointer bg-blue-500 hover:bg-blue-700  font-bold px-4 rounded '
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                  <div className='flex w-full justify-between text-gray-500 font-bold'>
                    <div className='flex w-[45%] gap-3 items-center'>
                      {" "}
                      <FaHeart /> Add to Wishlist
                    </div>
                    <div className='flex w-[45%] gap-3 items-center'>
                      {" "}
                      <FaBalanceScale className='text-2xl' /> compare
                    </div>
                  </div>
                  <div className='w-full border-b border-gray-500 mt-6   '></div>
                </div>
              </div>
              <div className='  p-[5%] ipad:w-full  tablet:py-[2%] tablet:px-[5%] ipad:m-auto '>
                <div className='flex gap-5 font-bold text-gray-500'>
                  <button
                    className={`${desc ? "text-blue-600" : ""}`}
                    onClick={toggleRev}
                  >
                    {" "}
                    Description
                  </button>
                  <button
                    className={`${rev ? "text-blue-600" : ""}`}
                    onClick={toggleRev}
                  >
                    Review
                  </button>
                </div>
                <div className='w-full border-b border-gray-500 mt-6   '></div>

                {desc && (
                  <div className='pt-6 flex flex-col gap-6'>
                    <h1 className='font-bold text-[2rem] border-l-2 pl-2'>
                      Lorem Title description
                    </h1>
                    <p className='text-gray-500'>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                      Perferendis nostrum, tempora commodi ullam eaque eligendi
                      nemo maxime? Cum accusantium necessitatibus, ratione
                      doloribus expedita alias neque ipsa nemo. Ex, esse harum?
                      ratione doloribus expedita alias neque ipsa nemo. Ex, esse
                      harum? ratione doloribus expedita alias neque ipsa nemo.
                      Ex, esse harum?
                    </p>
                    <p className='text-gray-500 mt-5'>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                      Perferendis nostrum, tempora commodi ullam eaque eligendi
                      nemo maxime? Cum accusantium necessitatibus, ratione
                      doloribus expedita alias neque ipsa nemo. Ex, esse harum?
                      ratione doloribus expedita alias neque ipsa nemo. Ex, esse
                      harum? ratione doloribus expedita alias neque ipsa nemo.
                      Ex, esse harum? ratione doloribus expedita alias neque
                      ipsa nemo. Ex, esse harum?
                    </p>
                    <p className='text-gray-500 mt-5'>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                      Perferendis nostrum, tempora commodi ullam eaque eligendi
                      nemo maxime? Cum accusantium necessitatibus, ratione
                      doloribus expedita alias neque ipsa nemo. Ex, esse harum?
                      ratione doloribus expedita alias neque ipsa nemo. Ex, esse
                      harum? ratione doloribus expedita alias neque ipsa nemo.
                      Ex, esse harum? ratione doloribus expedita alias neque
                      ipsa nemo. Ex, esse harum?
                    </p>
                  </div>
                )}
              </div>

              <div className=' flex flex-col h-full w-full px-[5%] ipad:w-full  tablet:py-[2%] tablet:px-[5%] ipad:m-auto'>
                {rev && (
                  <>
                    <div className='flex flex-col gap-4 mobile:flex-row mobile:justify-between ipad:justify-normal ipad:gap-[20%]'>
                      <div className='flex flex-col gap-5'>
                        <h2 className='font-[500] text-[18px] leading-none'>
                          Customer reviews
                        </h2>
                        <div className='flex items-center gap-4'>
                          <StarsRatings
                            rate={5}
                            filledStar='text-[17px] mobile:text-[1.1rem] bg-opacity-15 ipad:text-[1.1rem]'
                            emptyStar='text-[17px] mobile:text-[1.1rem] ipad:text-[1.1rem]'
                          />
                          <div className='relative hover:cursor-pointer'>
                            <span className='hover:scale-110 text-[17px]'>
                              (95 Reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='reviewss border--2 h-full w-full pt-3 flex flex-col'>
                      {rev &&
                        [0, 2].map((item: any) => (
                          <div
                            className='single-review mt-4 border-t   pt-4  border-inputCaption flex  flex-col gap-3 ipad:flex-ow ipad:gap11 ipad:justify-between '
                            key={item.id}
                          >
                            <div className='profile-ra flex gap-2 ipad:gap-3 '>
                              <div className='image '>
                                <img
                                  src={jordan}
                                  alt='website logo'
                                  className={`w-10 h-10 rounded-full rounded-m ipad:w-[2.5rem] ipad:h-[2.5rem]`}
                                />
                              </div>
                              <div className='rating flex flex-col gap-1 ipad:gap-2'>
                                <p className=' username text-[16px] leading-none font-[700]'>
                                  {item.user?.firstName} {item.user?.lastName}
                                </p>
                                <span className='ratings'>
                                  <StarsRatings
                                    rate={item.ratings}
                                    filledStar='text-[15px]  bg-opacity-15'
                                    emptyStar='text-[15px]'
                                  />
                                </span>
                              </div>
                            </div>
                            <div className='text-gray-500  feedback  text-[16px] ipad:w-[70%]'>
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Eum ratione consequuntur unde.
                              Necessitatibus quibusdam officia totam. Maiores
                              assumenda neque laudantium cumque nostrum!
                              Corrupti quae doloribus culpa fuga ipsum nihil
                              atque?
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
                <div className='mt-16 flex flex-col gap-4'>
                  <h1 className='font-bold text-[1.5rem] border-l-2 pl-2'>
                    Recommended Product
                  </h1>
                  <div className='flex flex-col gap-4 tablet:flex-row'>
                    {" "}
                    <RecommendedDesign />
                    <RecommendedDesign />
                    <RecommendedDesign />
                    <RecommendedDesign />
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      </div>
    </>
  );
};

export default ProductComp;
