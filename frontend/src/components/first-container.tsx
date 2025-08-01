import { Button } from "./ui/button";

function ContainerOne(){
    return(<>
        <div className=" absolute flex flex-col md:flex-row lg:flex-row items-center justify-between w-full h-[730px] bg-[rgba(194,223,241,1)] p-5">
            <div className="relative left-10 right-10 max-w-2xl mx-auto flex flex-col justify-center items-start gap-y-6 text-left font-mongolian p-8">
                <h3 className="text-[15px] text-black">Таны нүүрний хэлбэрт тохирох шил олдохгүй байна уу?</h3>
                <h1 className="text-5xl leading-normal tracking-tighter text-left font-extrabold text-gray-900">ТАНД 100% ТААРАХ <br/> НҮДНИЙ ШИЛ</h1>
                <p className=" text-[16px] text-left font-medium text-gray-500 text-base leading-relaxed">
                    Таны нүүрэнд яг тохирсон нүдний шилнүүд - <br/>
                    Дэлгэцэн дээр харагдаж байгаа шиг биш, үнэхээр таарах шил. Бид
                    нүүрний хэмжээ, PD буюу нүдний зайд үндэслэн таны нүүрний 
                    хэлбэрт яг тохирсон шил санал болгодог.
                </p>
                <Button className="
                    w-[150px] 
                    h-[40px]
                    bg-[#60b4f2] 
                    text-white 
                    rounded-xl 
                    px-6 
                    py-2 
                    shadow-[0_0_40px_#60b4f2] 
                    text-xs 
                    font-semibold 
                    hover:bg-[#4ea3e0] 
                    transition">ХЭМЖИХ <br/>ЗААВАРЧИЛГАА</Button>
            </div>
            <div className="w-[50%] left-10 md:w-[50%] relative md:left-7 md:top-2">
                <img src="./womanBackground.png" />
            </div>
        </div>
    </>);
}

export default ContainerOne;