export function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center md:grid-cols-3 gap-8">
          <div >
            <h3 className="text-white text-xl font-bold mb-4">Tusgal</h3>
            <p className="hover:text-white transition">Tusgal optic</p>
          </div>

          <div className=" flex flex-row justify-evenly items-start gap-8 md:gap-12">
            {/* Tusgal Column */}
            {/* <div>
                <h3 className="text-white text-xl font-bold mb-4">Тус</h3>
                <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">How it works</a></li>
                <li><a href="#" className="hover:text-white transition">Featured</a></li>
                <li><a href="#" className="hover:text-white transition">Partnership</a></li>
                <li><a href="#" className="hover:text-white transition">Bussiness Relation</a></li>
                </ul>
            </div> */}

            {/* Community Column */}
            <div>
                <h3 className="text-white text-xl font-bold mb-4">Холбогдох</h3>
                <ul className="space-y-2">
                <li><a  target="blank" href="https://www.facebook.com/tusgaleyeclinic" className="hover:text-white transition">Facebook(Энд дар)</a></li>
                <li><a href="tel:77116446" className="hover:text-white transition">77116446 (Залга)</a></li>
                <li><a href="tel:88076446" className="hover:text-white transition">88076446 (Залга)</a></li>
                <li><a target="blank" href="https://maps.app.goo.gl/62Qb3KhFR9uN5zPg6" className="hover:text-white transition">Хаяг(Энд дар)</a></li>
                </ul>
            </div>
            </div>
          </div>

        {/* Bottom Copyright Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>©2025 Gobi Tech Development. All rights reserved</p>
            {/* <div className="flex gap-8 mt-4 md:mt-0">
              <a className="hover:text-white transition">Нууцлал ба бодлого</a>
              <a className="hover:text-white transition">Нөхцөл</a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;