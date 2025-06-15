
import React from 'react';
import { Link } from 'react-router-dom';

const FooterSection: React.FC = () => (
  <footer className="bg-slate-900 text-slate-300 py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-white mb-4">Media Types</h3>
          <ul className="space-y-2">
            <li><Link to="#" className="hover:text-white transition-colors">Movies</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">TV Series</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Books</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Anime</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Manga</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">Features</h3>
          <ul className="space-y-2">
            <li><Link to="#" className="hover:text-white transition-colors">Track Progress</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Create Lists</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Rate & Review</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Stats & Insights</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Recommendations</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-lg font-bold text-white">MediaTracker</span>
        </div>
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MediaTracker. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default FooterSection;
