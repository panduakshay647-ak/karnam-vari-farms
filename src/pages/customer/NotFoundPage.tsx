import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Search, ArrowRight, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-24 h-24 mx-auto rounded-full bg-[#f4eee2] border-2 border-[#ebe0cd] flex items-center justify-center text-[#8b4513]">
        <Wheat className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="font-mono font-bold text-4xl sm:text-5xl text-[#1b4332]">404</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Page Not Found in Our Farm Fields
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
          The page you are looking for might have been harvested or relocated. Let's get you back on track!
        </p>
      </div>

      {/* Quick Search */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
        <input
          type="text"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder="Search farm powders, pachadlu, oils..."
          className="w-full pl-10 pr-20 py-2.5 bg-white border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#1b4332] text-white text-xs font-semibold rounded-lg hover:bg-[#2d5a27]"
        >
          Search
        </button>
      </form>

      {/* Quick Category Links */}
      <div className="pt-4 border-t border-[#f4eee2] flex flex-wrap justify-center gap-2 text-xs">
        <Link to="/" className="px-3.5 py-1.5 bg-[#1b4332] text-white rounded-lg flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <Link to="/category/powders" className="px-3.5 py-1.5 bg-white border border-[#ebe0cd] text-stone-700 rounded-lg hover:bg-[#faf7f2]">
          Powders
        </Link>
        <Link to="/category/dry-items" className="px-3.5 py-1.5 bg-white border border-[#ebe0cd] text-stone-700 rounded-lg hover:bg-[#faf7f2]">
          Dry Items
        </Link>
        <Link to="/category/pachadlu" className="px-3.5 py-1.5 bg-white border border-[#ebe0cd] text-stone-700 rounded-lg hover:bg-[#faf7f2]">
          Pachadlu
        </Link>
        <Link to="/category/oils" className="px-3.5 py-1.5 bg-white border border-[#ebe0cd] text-stone-700 rounded-lg hover:bg-[#faf7f2]">
          Oils
        </Link>
      </div>
    </div>
  );
};
