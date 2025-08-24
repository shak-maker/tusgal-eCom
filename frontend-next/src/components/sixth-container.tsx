"use client";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, StarHalf } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  id: number;
  rating: number;
  text: string;
  author: string;
  location: string;
  image: string;
}
function ContainerSix(){
    const testimonials: Testimonial[] = [
    {
      id: 1,
      rating: 5,
      text: "Хүүхдийнхээ шилийг байнга тусгалаар хийлгэдэг шүү. Маш эвтэйхэн шил хийдэг. Дараа хөнгөлөлт үзүүүлээрэй.",
      author: "Baysgalgan Baysgalan",
      location: "Ulaanbaatar Mongolia",
      image: "./1.jpg"
    },
    {
      id: 2,
      rating: 3.2,
      text: "Ram ni chanartai goy, nemj shine zagwaraar ramaa soliulmaar baina  ",
      author: "Амарбат",
      location: "Ulaanbaatar, Mongolia",
      image: "./2.jpg"
    },
    {
      id: 3,
      rating: 4.5,
      text: "Хүүхэн хараандаа тохируулж шилээ хийлгэснээс хойш толгой өвдөхөө больсондоо баярлалаа",
      author: "Тэнгис",
      location: "Ulaanbaatar, Mongolia",
      image: "./3.jpg"
    },
    {
      id: 4,
      rating: 4.5,
      text: "Хараагаа мэддэг болохоор вебсайтаар нь маш амархан захиалсан. Ирсэн шил гоё таарч байна.",
      author: "Маралмаа",
      location: "Ulaanbaatar, Mongolia",
      image: "./4.jpg"
    },
    {
      id: 5,
      rating: 4,
      text: "Одоо хол байгаа зүйлийг уншдаг болсон хамар өвдөхгүй хөнгөхөн сайхан рамтай юм. UUuuooooaaaaiiiiioooo",
      author: "Hoomiich Tulgaa",
      location: "Ulaanbaatar",
      image: "./5.jpg"
    },
    {
      id: 6,
      rating: 5,
      text: "I lost my glasses during trip and they made me a new glasses on the spot. Better than my previous glasses fr.",
      author: "Barry Allen",
      location: "Kanzas, US",
      image: "./6.jpg"
    },
  ];

  const [currentSet, setCurrentSet] = useState(0);
  const testimonialsPerPage = 3;
  const totalSets = Math.ceil(testimonials.length / testimonialsPerPage);

  // Function to render stars with precise decimal ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const nextSet = () => {
    setCurrentSet((prev) => (prev + 1) % totalSets);
  };

  const prevSet = () => {
    setCurrentSet((prev) => (prev - 1 + totalSets) % totalSets);
  };

  const visibleTestimonials = testimonials.slice(
    currentSet * testimonialsPerPage,
    (currentSet + 1) * testimonialsPerPage
  );

  return (
    <section id="sixth" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center тме, text-[rgba(72,98,132,1)]">
          Мянга мянган үйлчлүүлэгчдийн сэтгэл ханамж
        </h2>
        <p className="text-md text-gray-600 text-center mt-4 mb-8">
          Манай эмнэлгээр үйлчлүүлж, нүдний шил тохируулж авсан
          болон нарны шил авсан үйлчлүүлэгчдийн сэтгэгдлүүд
        </p>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 w-full mt-5 max-h-auto">
                <div className="flex flex-row gap-4">
                  <div>
                    <img src={testimonial.image} alt={`${testimonial.author} avatar`} 
                    className="w-10 h-10 rounded-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="text-sm font-medium ml-1">
                    {testimonial.rating.toFixed(1)}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button 
              onClick={prevSet}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalSets)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSet(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSet ? 'bg-blue-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={nextSet}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContainerSix;