import { useState } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import { apiUrl, assetUrl, getAuthHeaders } from "../config/api";
import { formatINR } from "../utils/currency";

const ListingCard = ({
  listingId,
  creator,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
}) => {
  const photos = listingPhotoPaths || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = (e) => {
    e?.stopPropagation?.();
    if (!photos.length) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
    );
  };

  const goToNextSlide = (e) => {
    e?.stopPropagation?.();
    if (!photos.length) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const wishList = user?.wishList || [];

  const isLiked = wishList?.find((item) => item?._id === listingId);

  const creatorId =
    typeof creator === "object" && creator !== null ? creator._id : creator;

  const isOwnListing =
    user?._id && creatorId && String(user._id) === String(creatorId);

  const patchWishList = async (e) => {
    e?.stopPropagation?.();
    if (!user?._id || !token) {
      navigate("/login");
      return;
    }
    if (isOwnListing) return;

    try {
      const response = await fetch(apiUrl(`/users/${user._id}/${listingId}`), {
        method: "PATCH",
        headers: getAuthHeaders(token, { "Content-Type": "application/json" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.log("Wishlist update failed", data.message);
        return;
      }
      if (Array.isArray(data.wishList)) {
        dispatch(setWishList(data.wishList));
      }
    } catch (err) {
      console.log("Wishlist update failed", err.message);
    }
  };

  return (
    <div
      className="listing-card"
      onClick={() => {
        if (listingId) navigate(`/properties/${listingId}`);
      }}
    >
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {photos.length > 0 ? (
            photos.map((photo, index) => (
              <div key={index} className="slide">
                <img src={assetUrl(photo)} alt={`Listing slide ${index + 1}`} />
                {photos.length > 1 && (
                  <>
                    <div
                      className="prev-button"
                      onClick={goToPrevSlide}
                    >
                      <ArrowBackIosNew sx={{ fontSize: "15px" }} />
                    </div>
                    <div
                      className="next-button"
                      onClick={goToNextSlide}
                    >
                      <ArrowForwardIos sx={{ fontSize: "15px" }} />
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="slide">
              <img src="/assets/addImage.png" alt="No listing media" />
            </div>
          )}
        </div>
      </div>

      <h3>
        {city}, {province}, {country}
      </h3>
      <p>{category}</p>

      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span>{formatINR(price)}</span> per night
          </p>
        </>
      ) : (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span>{formatINR(totalPrice)}</span> total
          </p>
        </>
      )}

      {!booking && (
        <button
          className="favorite"
          type="button"
          onClick={patchWishList}
          disabled={!user || isOwnListing}
          title={isOwnListing ? "Cannot wishlist your own listing" : "Wishlist"}
        >
          {isLiked ? (
            <Favorite sx={{ color: "red" }} />
          ) : (
            <Favorite sx={{ color: "white" }} />
          )}
        </button>
      )}
    </div>
  );
};

export default ListingCard;
