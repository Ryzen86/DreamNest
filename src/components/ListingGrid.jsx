import ListingCard from "./ListingCard";

const ListingGrid = ({ items, booking = false }) => {
  if (!items?.length) return null;

  return (
    <div className="list">
      {items.map((item) => {
        if (booking && item.listingId) {
          const { listingId, hostId, startDate, endDate, totalPrice } = item;
          return (
            <ListingCard
              key={item._id || listingId._id}
              listingId={listingId._id}
              creator={hostId}
              listingPhotoPaths={listingId.listingPhotoPaths}
              city={listingId.city}
              province={listingId.province}
              country={listingId.country}
              category={listingId.category}
              startDate={startDate}
              endDate={endDate}
              totalPrice={totalPrice}
              booking={true}
            />
          );
        }

        const {
          _id,
          creator,
          listingPhotoPaths,
          city,
          province,
          country,
          category,
          type,
          price,
        } = item;

        return (
          <ListingCard
            key={_id}
            listingId={_id}
            creator={creator}
            listingPhotoPaths={listingPhotoPaths}
            city={city}
            province={province}
            country={country}
            category={category}
            type={type}
            price={price}
            booking={booking}
          />
        );
      })}
    </div>
  );
};

export default ListingGrid;
