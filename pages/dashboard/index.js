
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';

const DashboardIndex = () => {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      switch (userRole) {
        case 'teacher':
          router.push('/dashboard/teacher');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'parent':
          router.push('/dashboard/parent');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        default:
          // In case the role is not defined, redirect to a default page or home
          router.push('/');
          break;
      }
    }
  }, [loading, currentUser, userRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Head>
          <title>جاري التحميل...</title>
        </Head>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl text-gray-700 font-bold">جاري التوجيه إلى لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Fallback, should be redirected by the useEffect hook
  return null;
};

export default DashboardIndex;
