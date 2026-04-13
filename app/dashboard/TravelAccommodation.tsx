import React, { useState } from "react";
import { JSX } from "react/jsx-runtime";

interface Hotel {
  id: number;
  name: string;
  rating: number;
  image?: string;
}

const TravelAccommodation: React.FC = () => {
  const partnerHotels: Hotel[] = [
    { id: 1, name: "Hotel Abhimaani Vasathi", rating: 3 },
    { id: 2, name: "Hotel Sunshine", rating: 4, image: "/hotel-sunshine.jpg" },
    { id: 3, name: "Hotel Paradise", rating: 5, image: "/hotel-paradise.jpg" },
    { id: 4, name: "Hotel Elite", rating: 4 },
  ];

  const defaultImage = "/image/download.jpg";

  const renderStars = (rating: number) => {
    const totalStars = 5;
    return (
      <div className="flex">
        {Array.from({ length: totalStars }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 mr-1 ${
              i < rating ? "text-yellow-500" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 
            1.371 1.24.588 1.81l-2.8 2.034a1 1 0 
            00-.364 1.118l1.07 3.292c.3.921-.755 
            1.688-1.54 1.118l-2.8-2.034a1 1 0 
            00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 
            1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 
            1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Featured Hotels
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnerHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} defaultImage={defaultImage} renderStars={renderStars} />
        ))}
      </div>
    </div>
  );
};

// Separate component to manage image state for each hotel
const HotelCard: React.FC<{ hotel: Hotel; defaultImage: string; renderStars: (rating: number) => JSX.Element }> = ({
  hotel,
  defaultImage,
  renderStars
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(hotel.image || defaultImage);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(defaultImage);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
      <div className="h-40 w-full">
        <img
          src={imageSrc}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-800">
          {hotel.name}
        </h4>
        {renderStars(hotel.rating)}
      </div>
    </div>
  );
};

export default TravelAccommodation;