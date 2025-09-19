import React from 'react';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-lg mb-6">Page Not Found</p>
    <a href="/" className="text-blue-600 hover:underline">Go Home</a>
  </div>
);

export default NotFound;
