import { Card } from "./ui/card";
import { MapPin, ShieldCheck, Phone } from "lucide-react";

function ContainerFour(){
    return (
    <section id="fourth" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8">


          {/* Content Section */}
          <div className="space-y-6 text-center">
            <h2 className="w-auto text-3xl font-bold text-center text-[rgba(72,98,132,1)]">
              Тусгал нүдний эмнэлгийн тухай
            </h2>
            <p className="text-md text-gray-600">
              Манай нүдний эмнэлэг нь 12 жилийн турш мэргэжлийн өндөр чанартай үйлчилгээ, 
              эмчилгээ үзүүлж байгаа бөгеөд таны нүдэнд төгс тохирсон нүдний шилийг 
              бодит туршлага шинжлэх ухаанд үндэслэн санал болгох болно.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {/* Image Section */}
              <div className="md:w-[100%]">
                  <img
                  src="./kidpic.png"
                  alt="Eye care professional"
                  className="w-full h-96 md:h-110 object-cover rounded-lg"
                  />
              </div>

              <div className="flex flex-col justify-center items-center md:ml-10 gap-5 bg-gray-50">
                {/* Customer Support */}
                <Card className="max-h-[140] p-3 bg-gray-100 hover:bg-white transition-colors border-0 shadow-none">
                  <div className="flex flex-row items-start gap-5">
                    <Phone className="border-2 border-[rgba(196,196,196,1)] bg-[rgba(196,196,196,1)] rounded-lg p-2 text-center mt-0 w-15 h-15 text-white" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Customer Support</h3>
                      <p className="text-gray-600 text-sm">
                        Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maccenas ultrices.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Best Price Guaranteed */}
                <Card className="max-h-[140] p-3 bg-gray-100 hover:bg-white transition-colors border-0 shadow-none">
                  <div className="flex flex-row items-start gap-3">
                    <ShieldCheck className="border-2 border-[rgba(196,196,196,1)] bg-[rgba(196,196,196,1)] rounded-lg p-2 text-center mt-0 w-15 h-15 text-white" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Best Price Guaranteed</h3>
                      <p className="text-gray-600 text-sm">
                        Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maccenas ultrices.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Many Location */}
                <Card className="max-h-[140] p-3 bg-gray-100 hover:bg-white transition-colors border-0 shadow-none">
                  <div className="flex flex-row items-start gap-3">
                    <MapPin className="border-2 border-[rgba(196,196,196,1)] bg-[rgba(196,196,196,1)] rounded-lg p-2 text-center mt-0 w-15 h-15 text-white" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Many Location</h3>
                      <p className="text-gray-600 text-sm">
                        Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maccenas ultrices.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContainerFour;