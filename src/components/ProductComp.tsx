/* eslint-disable @typescript-eslint/no-explicit-any */
//import { FaCartPlus, FaPlus, FaMinus } from 'react-icons/fa';
//import { useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import StarsRatings from "./Stars";
import ProductImageCard from "./Productimagecard";
import jordan from "../assets/jordan.jpeg";
//import Slider from "react-slick";

// import { IoChevronBackSharp } from 'react-icons/io5';
//import { Link } from 'react-router-dom';
// import Slider from 'react-slick';
// import { ScaleLoader } from 'react-spinners';
// import { DynamicData } from '../@types/DynamicData';
// import { ButtonIcon } from '../components/buttons/ButtonIcon';
// import ProductImageCard from '../components/cards/ProductImageCard';
// import SinglePageAddToCart from '../components/carts/SingleProductAddToCart';
// import ReviewForm from '../components/Forms/ReviewForm';
// import RatingModel from '../components/product/review/ratingModel';
// import StarsRatings from '../components/product/review/Stars';
// import UseScrollBarRemove from '../hooks/UseScrollBarRemove';
// import useToast from '../hooks/useToast';
// import useToken from '../hooks/useToken';
// import { fetchReview } from '../redux/features/getReviewSice';
// import { getSinleProducts } from '../redux/features/productSlice';
// import fetchInfo from '../utils/userDetails';
// import RecommendedProduct from './RecommendedProduct';
// import AddToWish from '../components/wishes/AddToWish';
// import { ThemeContext } from '../hooks/useWishcontext';
// import useWish from '../hooks/useWishlist';

const ProductComp = () => {
  //const dispatch = useAppDispatch();

  // const [reviewForm, setReviewForm] = useState(false);
  // const [ratingTab, setRatingTab] = useState(false);
  // const { accessToken } = useToken();
  // const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();
  // const { showErrorMessage, showSuccessMessage } = useToast();
  // useEffect(() => {
  // 	if (id) {
  // 		dispatch(getSinleProducts(id)).unwrap();
  // 	}
  // }, [dispatch, id]);
  // useEffect(() => {
  // 	dispatch(fetchReview(id || '')).unwrap();
  // }, [dispatch, id]);

  const singleProduct = [
    {
      images: [jordan, jordan, jordan],
    },
  ];
  const review = [
    {
      id: 1,
      user: {
        profileImage: "https://example.com/profile1.jpg",
        firstName: "John",
        lastName: "Doe",
      },
      ratings: 4.5,
    },
    {
      id: 2,
      user: {
        profileImage: "https://example.com/profile2.jpg",
        firstName: "Jane",
        lastName: "Smith",
      },
      ratings: 3.8,
    },
    {
      id: 3,
      user: {
        profileImage: "https://example.com/profile3.jpg",
        firstName: "Alice",
        lastName: "Johnson",
      },
      ratings: 5.0,
    },
  ];
  //   const settings = {
  //     dots: true,
  //     infinite: true,
  //     speed: 500,
  //     slidesToShow: 3,
  //     slidesToScroll: 1,
  //   };
  // const handleTotalrating = () => {
  // 	const obj = review;
  // 	if (obj) {
  // 		const total = obj.reduce(
  // 			(acc: number, item: DynamicData) => acc + item.ratings,
  // 			0,
  // 		);
  // 		const per = total / obj.length;
  // 		return Math.ceil(per) || 0;
  // 	}
  // };
  // const handleRating = () => {
  // 	ratingTab ? setRatingTab(false) : setRatingTab(true);
  // };
  // const handlePropagation = (event: DynamicData) => {
  // 	event?.stopPropagation();
  // };

  // const handleReviewForm = () => {
  // 	if (accessToken) {
  // 		reviewForm ? setReviewForm(false) : setReviewForm(true);
  // 	} else {
  // 		navigate('/login');
  // 	}
  // };
  // const user: DynamicData = new Array(fetchInfo());
  // let userRev: DynamicData[] | undefined;
  // if (review) {
  // 	userRev = review?.filter((item: DynamicData) => item.userId === user[0].id);
  // }
  // const { data: wishes } = useWish();

  // const settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 3,
  //   slidesToScroll: 1,
  // };
  return (
    <>
      <div
        className='min-h-screen relative pb-10 laptop:pb-0 mt-28 mobile:mt-32 ipad:mt-32'
        onClick={() => {
          //   if (ratingTab) setRatingTab(false);
          //   if (reviewForm) setReviewForm(false);
        }}
      >
        {
          <>
            <div className=' relative bg-neutral-white product_card w-[98%] mobile:max-w-[80%] m-auto h-auto rounded-2xl laptop:mt-44 laptop:mb-[6%]'>
              <div className='top_single_product flex flex-col tablet:flex-row gap-10 p-[5%] ipad:p-[6%] laptop:p-[4%]'>
                <div className='images flex flex-col w-full laptop:w-[50%]  tablet:bg-amber-600'>
                  <div className='image flex w-full h-[40vh]  mobile:h-[40vh] laptop:h-[50vh] rounded-2xl overflow-hidden relative'>
                    <img
                      src={jordan}
                      alt='single_product_image'
                      className='w-full object-cover h-full'
                    />

                    {/* <ThemeContext.Provider value={wishes}>
                      <AddToWish
                        productId={id || ""}
                        btnCss='absolute right-4 top-4'
                      />
                    </ThemeContext.Provider> */}
                    {/* <AddToWish
                        productId={id || ""}
                        btnCss='absolute right-4 top-4'
                      /> */}
                  </div>
                  {/* <Slider {...settings}>
                    {singleProduct[0]?.images?.map(
                      (item: string, index: number) => (
                        <ProductImageCard key={index} image={item} idx={0} />
                      )
                    )}
                  </Slider> */}               
                    {singleProduct[0]?.images?.map(
                      (item: string, index: number) => (
                        <ProductImageCard key={index} image={item} idx={0} />
                      )
                    )}                                    
                </div>
                <div className='description flex flex-col flex-1 gap-10 pt-6 px-5'>
                  <h1 className='text-2xl font-semibold'>
                    {/* {singleProduct[0]?.name} */}
                    Product name
                  </h1>
                  <h1 className='text-2xl font-semibold'>
                    {/* {singleProduct[0]?.price}{" "} */}
                    343454
                    <small className='text-base font-normal'>RWF</small>
                  </h1>
                  {/*
				 shyiramo add to cart  
				  {id && <SinglePageAddToCart productId={id} />} */}
                </div>
              </div>
              {/* <Link to={"/products"}>
                <ButtonIcon className='absolute py-1 mobile:py-2 -top-8 mobile:top-0 right-0 ipad:top-4 mobile:-right-20 mobile:px-6 ipad:px-8 ipad:right-4 bg-transparent bg-primary-lightblue text-neutral-white border-primary-lightblue border-2 '>
                  <IoChevronBackSharp />
                </ButtonIcon>
              </Link> */}

              <div className='review-on-single product relative flex flex-col h-full w-full  p-[5%] ipad:w-full  tablet:py-[2%] tablet:px-[5%] ipad:m-auto   '>
                <div className='flex flex-col gap-4 mobile:flex-row mobile:justify-between ipad:justify-normal ipad:gap-[20%]'>
                  <div className='flex flex-col gap-5'>
                    <h2 className='font-[500] text-[18px] leading-none'>
                      Customer reviews
                    </h2>
                    <div className='flex items-center gap-4'>
                      <h2 className='text-inputCaption'>
                        <p className='bg-blue-100 text-black text-sm font-semibold inline-flex items-center p-1.5 rounded'>
                          {/* {handleTotalrating()} */}
                        </p>
                      </h2>
                      <StarsRatings
                        rate={5}
                        filledStar='text-[17px] mobile:text-[1.1rem] bg-opacity-15 ipad:text-[1.1rem]'
                        emptyStar='text-[17px] mobile:text-[1.1rem] ipad:text-[1.1rem]'
                      />
                      <div
                        className='relative hover:cursor-pointer'
                        // onMouseEnter={() => setRatingTab(true)}
                        // onMouseLeave={() => setRatingTab(false)}
                      >
                        <span className='hover:scale-110'>
                          <IoMdArrowDropdown
                            data-testid='drop-down-tab-rate'
                            className='dropDown text-[18px] mobile:text-[2rem]'
                            //   onClick={() => handleRating()}
                          />
                        </span>
                        {/* {ratingTab && <RatingModel />} */}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col gap-5'>
                    <span className='flex flex-col gap-1'>
                      <h1 className='font-[500] text-[18px] leading-none'>
                        Review this product
                      </h1>
                      <p className='text-inputCaption text-[13px]'></p>
                    </span>

                    <button
                      className='bg-custom-gradient w-[11rem]  hover:scale-105  text-neutral-white text-center py-[2%]  rounded  text-[12px] mobile:w-[90%] ipad:max-w-[11rem] mobile:px-2'
                      //  onClick={() => handleReviewForm()}
                      data-testid='first-button-submit-review'
                    >
                      {"Submit your review"}
                    </button>
                  </div>
                </div>

                <div className='reviewss border--2 h-full w-full pt-3 flex flex-col'>
                  <h1 className='font-[500] text-[18px]'>Top reviews</h1>
                  {review &&
                    review.length > 0 &&
                    review.slice(0, 2).map((item: any) => (
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
                                filledStar='text-[12px]  bg-opacity-15'
                                emptyStar='text-[12px]'
                              />
                            </span>
                          </div>
                        </div>
                        <div className='feedback text-inputCaption text-[14px] ipad:w-[70%]'>
                          {item.feedBack}
                        </div>
                      </div>
                    ))}
                </div>

                <div className='flex flex-col gap-4 py-2.5 mobile:flex-row mobile:justify-between ipad:justify-normal ipad:gap-[20%]'>
                  <p className='font-medium text-blue-600 dark:text-blue-500 hover:underline'>
                    view more reviews
                  </p>
                </div>
              </div>
            </div>
            <div
              className={`${"fixed top-0 left-0  h-full w-full z-[200] b-neutral-white items-center justify-center hidden"}`}
            >
              <div className='fixed w-full h-full z-[50] bg-neutral-black/50 left-0 top-0'></div>
              {/* <div
                className='formWrapper z-[400] w-[90%] h-auto max-h-[90vh] bg-neutral-white rounded-xl mobile:w-[90%] overflow-y-scroll ipad:max-w-[50.5rem] '
                onClick={handlePropagation}
              >
                <UseScrollBarRemove
                  children={
                    <ReviewForm
                      id={id || ""}
                      handleReviewform={handleReviewForm}
                      successMessage={showSuccessMessage}
                      Erromesage={showErrorMessage}
                    />
                  }
                  isVisible={reviewForm}
                />
              </div> */}
            </div>
            <div className='relative w-[98%] mobile:max-w-[80%] m-auto h-auto mobile:mt-5 laptop:mt-14 laptop:mb-[3%]'>
              {/* <RecommendedProduct prodId={id as string} /> */}
            </div>
          </>
        }
      </div>
    </>
  );
};

export default ProductComp;
