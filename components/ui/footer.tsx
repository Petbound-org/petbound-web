"use client"

import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Section */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">Petbound</h3>
          <p className="text-sm text-gray-400">
            The adoption platform exclusively for animals at risk of euthanasia, giving pets a second chance at life.
          </p>
        </div>

        {/* Middle Section */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/about-us" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/explore" className="hover:text-white transition-colors">Explore</a></li>
            {/* <li><a href="#" className="hover:text-white transition-colors">Contact</a></li> */}
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Socials</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><Facebook size={20} /></a>
            <a href="https://www.instagram.com/petboundorg/" className="hover:text-white"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white"><Twitter size={20} /></a>
            <a href={`mailto:petboundorg@gmail.com`} className="hover:text-white"><Mail size={20} /></a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Petbound. All rights reserved.
      </div>
    </footer>
  )
}
