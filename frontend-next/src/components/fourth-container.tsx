import { Card } from "./ui/card";
import Image from "next/image";
function ContainerFour(){
    return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Image Section */}


          {/* Content Section */}
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Тустал нудний змінялтийн тухай
            </h2>
            <p className="text-lg text-gray-600">
              Манай нудний змінялат на 12 жилийн турш маргэжлийн ендер чанартай уймчилгаз, 
              змчилгаз уздудж байгаа бөгеөд таны нудэнд тегс тәхирсон нудний шилийг 
              бодит туршлага шинжлах ухаандундаслан санал болгох болью.
            </p>

            <div className="lg:w-1/2">
                <img
                src="./kidpic.png" // Replace with your image path
                alt="Eye care professional"
                className="w-full h-96 object-cover rounded-lg"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
                <p className="text-gray-500">
                  Айquam erat volutpat. Integer malesuada turpis id fringilla suscipit. 
                  Maecenas ultrices.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Best Price Guaranteed</h3>
                <p className="text-gray-500">
                  Айquam erat volutpat. Integer malesuada turpis id fringilla suscipit. 
                  Maecenas ultrices.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Many Locations</h3>
                <p className="text-gray-500">
                  Айquam erat volutpat. Integer malesuada turpis id fringilla suscipit. 
                  Maecenas ultrices.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContainerFour;