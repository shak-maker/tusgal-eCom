

function ContainerThree(){
    return (
    <>
    
        <section id="third">
            <div className="grid grid-cols-1 bg-gray-50 py-10 text-center px-2 sm:px-4">
                <h1 className="text-2xl sm:text-3xl text-[rgba(72,98,132,1)] font-medium mb-10">Тусгалаас худалдан авах тухай</h1>
                <div className="flex flex-col sm:flex-row sm:justify-evenly sm:items-center gap-8">
                    <div className="flex flex-col justify-between items-center sm:w-[30%] mb-auto gap-4">
                        <div className="border-2 border-[rgba(193,223,241,0)] bg-[rgba(193,223,241,0.2)] rounded-lg p-4">
                            <img src="./emote1.png" alt="" />
                        </div>
                        <div className="sm:w-[70%]">
                            <h3 className="text-2xl font-bold mb-6 text-[rgba(72,98,132,1)] border-gray-200">PD(Нүдний зай) </h3>
                            <p className="text-md leading-relaxed text-gray-800">Таны нүдний хүүхэн харааны хоорондох зайг авж таны нүүрэнд тохирсон шилийг хийж өгнө. Толгой эргэж, нүд өвдөхгүй, толгой өвдөхгүй байх давуу талтай. </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-center sm:w-[30%] mb-auto gap-4">
                        <div className="border-2 border-[rgba(193,223,241,0)] bg-[rgba(193,223,241,0.2)] rounded-lg p-4">
                            <img src="./emote2.png" alt="" />
                        </div>
                        <div className="sm:w-[70%]">
                            <h3 className="text-2xl font-bold mb-6 text-[rgba(72,98,132,1)] border-gray-200">Зүүж үзэх</h3>
                            <p className="text-md leading-relaxed text-gray-800">Та санал болгосон шилнүүд дундаас сонголтоо хийн
                                Тусгалын зүүж үзэх функцыг ашиглан яг л дэлгүүрт 
                                зүүж үзэж буй мэтээр өөрийгөө харах боломжтой.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-center sm:w-[30%] mb-auto gap-4">
                        <div className="border-2 border-[rgba(193,223,241,0)] bg-[rgba(193,223,241,0.2)] rounded-lg p-4">
                            <img src="./emote3.png" alt="" />
                        </div>
                        <div className="sm:w-[70%]">
                            <h3 className="text-2xl font-bold mb-6 text-[rgba(72,98,132,1)] border-gray-200">Хүргэлтээр авах</h3>
                            <p className="text-md leading-relaxed text-gray-800">Таны сонгон авсан нүдний шилийг түргэн
                                шуурхайгаар тодорхой хаягт тань хүргэнэ.
                            </p>
                        </div>
                    </div>
                </div>
            
            </div>
        </section>    

    </>
  );
}

export default  ContainerThree;