export function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center md:grid-cols-3 gap-8">
          <div >
            <h3 className="text-white text-xl font-bold mb-4">Tusgal</h3>
            <p className="hover:text-white transition">Tusgal vision</p>
          </div>

          <div className=" flex flex-row justify-evenly items-start gap-8 md:gap-12">
            {/* Tusgal Column */}
            <div>
                <h3 className="text-white text-xl font-bold mb-4">About</h3>
                <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">How it works</a></li>
                <li><a href="#" className="hover:text-white transition">Featured</a></li>
                <li><a href="#" className="hover:text-white transition">Partnership</a></li>
                <li><a href="#" className="hover:text-white transition">Bussiness Relation</a></li>
                </ul>
            </div>

            {/* Community Column */}
            <div>
                <h3 className="text-white text-xl font-bold mb-4">Community</h3>
                <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Events</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Podcast</a></li>
                <li><a href="#" className="hover:text-white transition">Invite a friend</a></li>
                </ul>
            </div>
            </div>
          </div>

        {/* Bottom Copyright Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>©2025 Full Stack Gang. All rights reserved</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a className="hover:text-white transition">Нууцлал ба бодлого</a>
              <a className="hover:text-white transition">Нөхцөл</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;