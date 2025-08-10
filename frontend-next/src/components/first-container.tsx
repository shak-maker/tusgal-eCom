import { Button } from "./ui/button";

function ContainerOne() {
  return (
    <div id="first" className="grid grid-cols-1 sm:grid-cols-2 mt-20 min-h-[600px] bg-[rgba(194,223,241,1)] p-5">
      {/* Text Content (unchanged) */}
      <div className="max-w-2xl w-full flex flex-col justify-center items-start gap-y-6 text-left font-mongolian p-4 md:p-8">
        <h3 className="text-[15px] w-full text-center md:text-left text-black">
          Таны нүүрний хэлбэрт тохирох шил олдохгүй байна уу?
        </h3>
        <h1 className="text-4xl md:text-5xl w-full text-center md:text-left leading-normal tracking-tighter font-extrabold text-gray-900">
          ТАНД 100% ТААРАХ НҮДНИЙ ШИЛ
        </h1>
        <p className="text-[16px] w-full text-center md:text-left font-medium text-gray-500 text-base leading-relaxed">
          Таны нүүрэнд яг тохирсон нүдний шилнүүд - <br />
          Дэлгэцэн дээр харагдаж байгаа шиг биш, үнэхээр таарах шил. Бид нүүрний
          хэмжээ, PD буюу нүдний зайд үндэслэн таны нүүрний хэлбэрт яг тохирсон
          шил санал болгодог,
        </p>
        <div className="w-full flex justify-center md:justify-start">
          <Button
            className="bg-[#60b4f2] cursor-pointer mb-5 sm:mb-0 text-white rounded-xl px-10 py-6 shadow-[0_0_25px_#60b4f2] text-xs font-semibold hover:bg-[#4ea3e0] transition"
          >
            ХЭМЖИХ <br /> ЗААВАРЧИЛГАА
          </Button>
        </div>
      </div>

      {/* Image Container - Modified for larger size */}
      <div className="flex justify-center items-center p-0 md:p-4">
        <img
          src="/womanBackground.png"
          alt="Woman Background"
          className="w-full max-w-[550px] ml-10 sm:ml-5 sm:w-[105%] md:max-w-none md:w-[120%] lg:w-[117%] xl:w-[160%] xl:ml-12 2xl:w-[170%] object-contain"
        />
      </div>
    </div>
  );
}

export default ContainerOne;