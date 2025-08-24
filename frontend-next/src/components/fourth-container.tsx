import { Card } from "./ui/card";
import { MapPin, ShieldCheck, Phone } from "lucide-react";

function ContainerFour() {
  return (
    <section id="fourth" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Title + Intro */}
          <div className="space-y-6 text-center max-w-4xl w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-[rgba(72,98,132,1)]">
              Тусгал нүдний эмнэлгийн тухай
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Ижил нэрт эмнэлгийн доор үйл ажиллагаа явуулж буй <b>Тусгал Оптик</b> нь
              таны гэр бүлийн харааг хамгаалж өгнө.
            </p>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center w-full max-w-6xl">
            {/* Image */}
            <div className="w-full">
              <img
                src="./kidpic.png"
                alt="Eye care professional"
                className="w-full h-72 sm:h-96 md:h-[450px] object-cover rounded-2xl shadow-md"
              />
            </div>

            {/* Info Cards */}
            <div className="flex flex-col gap-6 w-full">
              {[
                {
                  icon: <Phone className="w-6 h-6 text-white" />,
                  gradient: "from-blue-500 to-blue-600",  
                  title: "Утсаар холбогдох",
                  desc: "Тусгалтай холбогдох утасны дугаар: 77116446",
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-white" />,
                  gradient: "from-green-500 to-emerald-600",
                  title: "Хямд үнийн баталгаа",
                  desc: "Танд зах зээл дээрх хамгийн хямд үнэ.",
                },
                {
                  icon: <MapPin className="w-6 h-6 text-white" />,
                  gradient: "from-purple-500 to-violet-600",
                  title: "Хаяг, байршил",
                  desc: "Хан уул дүүрэг, Сүмбэр tower 2, 3 давхар.",
                },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="p-5 bg-white hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-row items-start gap-4">
                    <div
                      className={`bg-gradient-to-br ${item.gradient} rounded-xl p-3 shadow-lg flex items-center justify-center`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold text-[rgba(72,98,132,1)]">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContainerFour;
