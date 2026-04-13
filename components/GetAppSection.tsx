// components/GetAppSection.tsx
"use client";

import Image from "next/image";
import { FaGooglePlay, FaApple } from "react-icons/fa";

export default function GetAppSection() {
  return (
    <section className="border rounded-sm p-6 bg-white max-w-6xl mx-auto my-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left: Phones Image */}
        <div className="flex justify-center">
          <Image
            src="/images/mobileimg.png" // replace with your actual image path
            alt="Phones"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>

        {/* Right: Text and Form */}
        <div className="text-center md:text-left">
          <h2 className="text-lg md:text-xl font-semibold">
            Looking for the Event Feed? Get the app!
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Find great events to attend, connect with new opportunities and expand your networking!
          </p>

          {/* Email Input */}
          <div className="flex justify-center md:justify-start mt-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="border px-3 py-2 rounded-l-md focus:outline-none w-64"
            />
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-md">
              Send Link
            </button>
          </div>

          {/* App Store Buttons */}
   <div className="flex gap-4 justify-center md:justify-start mt-6">
      {/* Google Play Button */}
      <a
        href="https://play.google.com/store"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md transition-transform transform hover:scale-105 active:scale-95"
      >
        <FaGooglePlay size={20} />
        <span>Google Play</span>
      </a>

      {/* App Store Button */}
      <a
        href="https://www.apple.com/app-store/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md shadow-md transition-transform transform hover:scale-105 active:scale-95"
      >
        <FaApple size={20} />
        <span>App Store</span>
      </a>
    </div>

        </div>
      </div>
    </section>
  );
}
