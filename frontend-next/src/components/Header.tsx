import Image from "next/image";

function Header(){
    return(<>
        <div className="sticky w-full h-[80px] md:h-[100px] lg:h-[100px] flex flex-row items-center justify-between bg-[rgba(255,255,255,1)] p-4">
            <a href="" className="w-[100px] md:w-[120px] lg:w-[120px] h-[30px] md:h-[40px] lg:h-[40px] flex items-center md:ml-5">
                <Image src="/brandLogo.png" alt="Brand Logo" width={120} height={40} />
            </a>
            <nav className="w-[350px] md:w-[493px] lg:w-[493px] h-[30px] md:h-[25px] lg:h-[25px] ml-auto mr-10 sm:mr-5">
                <ul className="flex space-x-4 md:space-x-6 lg:space-x-6 justify-center items-center h-full">
                    <li>
                        <a href="#home" 
                        className="text-[rgba(255,0,0,1)] relative 
                            after:content-[''] 
                            after:absolute 
                            after:bottom-0 
                            after:left-0 
                            after:w-0 
                            after:h-[2px] 
                            after:bg-gray-500 
                            after:transition-all 
                            after:duration-300 
                            hover:after:w-full">Нүүр</a>
                    </li>
                    <li>
                        <a href="#about" className="text-[rgba(94,172,221,1)]
                            relative 
                            after:content-[''] 
                            after:absolute 
                            after:bottom-0 
                            after:left-0 
                            after:w-0 
                            after:h-[2px] 
                            after:bg-gray-500 
                            after:transition-all 
                            after:duration-300 
                            hover:after:w-full">Шил авах</a>
                    </li>
                    <li>
                        <a href="#about" className="text-[rgba(94,172,221,1)]
                            relative 
                            after:content-[''] 
                            after:absolute 
                            after:bottom-0 
                            after:left-0 
                            after:w-0 
                            after:h-[2px] 
                            after:bg-gray-500 
                            after:transition-all 
                            after:duration-300 
                            hover:after:w-full">Нүүрний хэлбэр олох</a>
                    </li>
                    <li>
                        <a href="#about" className="text-[rgba(94,172,221,1)]
                            relative 
                            after:content-[''] 
                            after:absolute 
                            after:bottom-0 
                            after:left-0 
                            after:w-0 
                            after:h-[2px] 
                            after:bg-gray-500 
                            after:transition-all 
                            after:duration-300 
                            hover:after:w-full">Зааварчилгаа</a>
                    </li>
                </ul>
                
            </nav>
            <a href="" className="w-[35px] md:w-[40px] lg:w-[40px] h-[35px] md:h-[40px] lg:h-[40px] 
            flex items-center border-l-2 border-gray-500 pl-2 mr-15 sm:mr-10 gap-5">
                <Image src="/shopping.png" className="transition-transform duration-300 hover:scale-110 ml-5" alt="Shopping" width={40} height={40} />
            </a>
        </div>
    </>);
}

export default Header;