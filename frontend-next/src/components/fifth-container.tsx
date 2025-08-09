
function ContainerFive(){

    const images = [
        "./rocklee.jpg",
        "./itachi222.png",
    ]
    
    const imageElements = images.map((image, index) => (
        <img key={index} src={image} alt={`Image ${index + 1}`}
        className="w-full sm:w-[50%] max-w-[400px] lg:max-w-[500px] h-96 object-cover" />
    ));


    return(<>
        <div id="fifth" className="bg-gray-200 p-5 md:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 lg:gap-12">
                {imageElements}
            </div>
        </div>
    </>);
}

export default ContainerFive;