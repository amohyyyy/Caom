
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';
import Link from 'next/link';

const auth = getAuth(app);
const db = getFirestore(app);

const StudentDashboard = () => {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);

  // Redirect if not a student
  useEffect(() => {
    if (!loading && currentUser && userRole !== 'student') {
      router.push('/dashboard');
    }
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
  }, [loading, currentUser, userRole, router]);

  // Fetch all available courses
  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesArray = [];
      querySnapshot.forEach((doc) => {
        coursesArray.push({ id: doc.id, ...doc.data() });
      });
      setCourses(coursesArray);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (loading || userRole !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-700">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 md:p-16">
      <Head>
        <title>لوحة الطالب - منصة التعليم</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800">لوحة الطالب</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            تسجيل الخروج
          </button>
        </header>

        {/* Available Courses Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">الدورات المتاحة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">لا توجد دورات متاحة حاليًا.</p>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-blue-700 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
                  <Link href={`/courses/${course.id}`} className="text-blue-500 hover:underline font-semibold">
                    عرض الدورة
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
