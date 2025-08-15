
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';
import { getFirestore, collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';
import Link from 'next/link';

const auth = getAuth(app);
const db = getFirestore(app);

const TeacherDashboard = () => {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not a teacher
  useEffect(() => {
    if (!loading && currentUser && userRole !== 'teacher') {
      router.push('/dashboard');
    }
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
  }, [loading, currentUser, userRole, router]);

  // Fetch courses owned by the current user
  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'courses'), where('ownerId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const coursesArray = [];
        querySnapshot.forEach((doc) => {
          coursesArray.push({ id: doc.id, ...doc.data() });
        });
        setCourses(coursesArray);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('الرجاء إدخال عنوان ووصف للدورة.');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'courses'), {
        title,
        description,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('فشل في إنشاء الدورة. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (loading || userRole !== 'teacher') {
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
        <title>لوحة المعلم - منصة التعليم</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800">لوحة المعلم</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            تسجيل الخروج
          </button>
        </header>

        {/* Create Course Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">إنشاء دورة جديدة</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">
                عنوان الدورة
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
                وصف الدورة
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            >
              {formLoading ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
            </button>
          </form>
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">دوراتي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">لم تقم بإنشاء أي دورات بعد.</p>
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

export default TeacherDashboard;
