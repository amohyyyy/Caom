
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <Head>
        <title>منصة التعليم</title>
      </Head>
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-2xl w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">أهلاً بك في منصة التعليم</h1>
        <p className="text-lg text-gray-700 mb-8">
          منصتك الشاملة لتعلم وإدارة الدورات التعليمية والاختبارات التفاعلية.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4 md:rtl:space-x-reverse flex flex-col md:flex-row justify-center">
          <Link href="/auth/signup" className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300">
            إنشاء حساب جديد
          </Link>
          <Link href="/auth/login" className="w-full md:w-auto border-2 border-blue-600 text-blue-600 font-bold py-3 px-6 rounded-md hover:bg-blue-50 hover:text-blue-700 transition duration-300">
            سجل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
