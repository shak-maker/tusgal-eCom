"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Fetch cart count on component mount
    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  async function fetchCartCount() {
    try {
      const res = await fetch('/api/cart/count');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 z-50 w-full h-[80px] md:h-[100px] lg:h-[100px] flex flex-row items-center justify-between bg-[rgba(255,255,255,1)] p-4">
        <Link href="/" className="w-[100px] md:w-[120px] lg:w-[120px] h-[30px] md:h-[40px] lg:h-[40px] flex items-center md:ml-5">
          <img src="/brandLogo.png" alt="Brand Logo" className="ml-5 md:ml-8" />
        </Link>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="absolute right-20 hidden md:block w-[350px] md:w-[493px] lg:w-[493px] h-[30px] md:h-[25px] lg:h-[25px] ml-auto mr-10 sm:mr-5">
          <ul className="flex space-x-4 md:space-x-6 lg:space-x-6 justify-center items-center h-full">
            <li>
              <a href="#home" className="text-[rgba(255,0,0,1)] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-500 after:transition-all after:duration-300 hover:after:w-full">Нүүр</a>
            </li>
            <li>
              <Link href="/products" className="text-[rgba(94,172,221,1)] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-500 after:transition-all after:duration-300 hover:after:w-full">Products</Link>
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
        <Link href="/cart" className="absolute right-0 md:flex items-center border-l-2 border-gray-500 pl-2 mr-15 sm:mr-10 gap-5 relative group">
          <div className="relative">
            <img src="/shopping.png" className="transition-transform duration-300 hover:scale-110 ml-5" alt="Shopping" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
        </Link>

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
      <div className={`md:hidden fixed top-[80px] left-0 w-full bg-white z-50 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <ul className="flex flex-col items-center space-y-4 px-4 pb-4">
          <li>
            <a 
                href="#home" 
                className="text-[rgba(255,0,0,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
            >
                Нүүр
            </a>
            </li>
            <li>
            <Link 
                href="/products" 
                className="text-[rgba(94,172,221,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
            >
                Products
            </Link>
            </li>
            <li>
            <a 
                href="#about" 
                className="text-[rgba(94,172,221,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
            >
                Нүүрний хэлбэр олох
            </a>
            </li>
            <li>
            <a 
                href="#about" 
                className="text-[rgba(94,172,221,1)] font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
            >
                Зааварчилгаа
            </a>
            </li>
            {/* Mobile Cart Link */}
            <li className="w-full">
              <Link 
                href="/cart" 
                className="flex items-center justify-center space-x-2 text-gray-900 font-bold text-lg md:text-xl hover:bg-gray-100 rounded-full px-4 py-2 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <img src="/shopping.png" className="w-6 h-6" alt="Shopping" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </li>
        </ul>
      </div>
    </>
  );
}

export default Header;