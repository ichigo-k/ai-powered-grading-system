"use client";

import React from "react";

import Image from "next/image";

const LoadingLogo = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <Image 
          src="/assests/rocket.gif" 
          alt="Loading..." 
          width={128} 
          height={128}
          className="object-contain"
          unoptimized 
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest animate-pulse">
          Launching Resources...
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
          Wait a second
        </p>
      </div>
    </div>
  );
};

export default LoadingLogo;
