import Image from "next/image";

function ContainerOne(){
    return(<>
        <div className=" absolute flex flex-row md:flex-row lg:flex-row items-center justify-between w-full h-[730px] bg-[rgba(194,223,241,1)] p-5">
            <div className="relative left-10 right-10 max-w-2xl mx-auto flex flex-col justify-center items-start gap-y-6 text-left font-mongolian p-8">
                <h3 className="text-[15px] text-black">Таны нүүрний хэлбэрт тохирох шил олдохгүй байна уу?</h3>
                <h1 className="text-5xl leading-normal tracking-tighter text-left font-extrabold text-gray-900">ТАНД 100% ТААРАХ <br/> НҮДНИЙ ШИЛ</h1>
                <p className=" text-[16px] text-left font-medium text-gray-500 text-base leading-relaxed">
                    Таны нүүрэнд яг тохирсон нүдний шилнүүд - <br/>
                    Дэлгэцэн дээр харагдаж байгаа шиг биш, үнэхээр таарах шил. Бид
                    нүүрний хэмжээ, PD буюу нүдний зайд үндэслэн таны нүүрний 
                    хэлбэрт яг тохирсон шил санал болгодог,
                </p>
                <button>ХЭМЖИХ ЗААВАРЧИЛГАА</button>
            </div>
            <div className="w-[50%] relative left-7 top-2">
                <Image src="/womanBackground.png" alt="Woman Background" width={600} height={600} />
            </div>
        </div>
    </>);
}

export default ContainerOne;