"use client";
import { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="sticky w-full h-[80px] md:h-[100px] lg:h-[100px] flex flex-row items-center justify-between bg-[rgba(255,255,255,1)] p-4">
        <a href="" className="w-[100px] md:w-[120px] lg:w-[120px] h-[30px] md:h-[40px] lg:h-[40px] flex items-center md:ml-5">
          <img src="/brandLogo.png" alt="Brand Logo" className="ml-15 md:ml-8" />
        </a>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="absolute right-20 hidden md:block w-[350px] md:w-[493px] lg:w-[493px] h-[30px] md:h-[25px] lg:h-[25px] ml-auto mr-10 sm:mr-5">
          <ul className="flex space-x-4 md:space-x-6 lg:space-x-6 justify-center items-center h-full">
            <li>
              <a href="#home" className="text-[rgba(255,0,0,1)] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-500 after:transition-all after:duration-300 hover:after:w-full">Нүүр</a>
            </li>
            <li>
              <a href="#about" className="text-[#15191b] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-500 after:transition-all after:duration-300 hover:after:w-full">Шил авах</a>
            </li>
            <li>
              <a href="#about" className="text-[rgba(94,172,221,1)] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-500 after:transition-all after:duration-300 hover:after:w-full">Нүүрний хэлбэр олох</a>
            </li>
            <li>
              <a href="#about" className="text-[rgba(94,172,221,1)] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-500 after:transition-all after:duration-300 hover:after:w-full">Зааварчилгаа</a>
            </li>
          </ul>
        </nav>

        {/* Shopping Cart (Hidden on Mobile) */}
        <a href="" className="absolute right-0 md:flex items-center border-l-2 border-gray-500 pl-2 mr-15 sm:mr-10 gap-5">
          <img src="/shopping.png" className="transition-transform duration-300 hover:scale-110 ml-5" alt="Shopping" />
        </a>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleMenu}
          className="absolute right-30 md:hidden lg:hidden flex flex-col justify-center items-center w-8 h-8 ml-auto mr-4"
          aria-label="Toggle Menu"
        >
          <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0' : 'mb-1.5'}`}></span>
          <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'mb-1.5'}`}></span>
          <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden fixed top-[80px] left-0 w-full bg-white z-50 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <ul className="flex flex-col items-center space-y-4">
          <li>
            <a 
                href="#home" 
                className="text-[rgba(255,0,0,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
            >
                Нүүр
            </a>
            </li>
            <li>
            <a 
                href="#about" 
                className="text-[#15191b] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
            >
                Шил авах
            </a>
            </li>
            <li>
            <a 
                href="#about" 
                className="text-[rgba(94,172,221,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
            >
                Нүүрний хэлбэр олох
            </a>
            </li>
            <li>
            <a 
                href="#about" 
                className="text-[rgba(94,172,221,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
            >
                Зааварчилгаа
            </a>
            </li>
        </ul>
      </div>
    </>
  );
}

export default Header;