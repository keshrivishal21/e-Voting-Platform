import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-indigo-900 to-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* Heading */}
        <h3 className="text-3xl font-semibold tracking-wide text-indigo-200 mb-4">
          e-Voting Platform for Student Elections
        </h3>

        {/* Description */}
        <p className="text-center max-w-4xl text-sm md:text-base font-normal leading-relaxed text-indigo-100">
                    A secure and transparent platform for students to vote, view results, and participate in campus elections easily.<br/>
                              Empowering every student to make their voice heard and shape the future of their campus.


        </p>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-indigo-800">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs md:text-sm font-light text-indigo-300">
          <a href="#" className="hover:underline">
            eVoting
          </a>{" "}
          © 2025. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
