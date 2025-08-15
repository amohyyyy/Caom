
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';
import { getFirestore, doc, getDoc, collection, query, onSnapshot, where, addDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';
import Link from 'next/link';

const auth = getAuth(app);
const db = getFirestore(app);

const CoursePage = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { currentUser, userRole, loading } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch course details and check for quiz
  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        const courseDocRef = doc(db, 'courses', courseId);
        const courseDocSnap = await getDoc(courseDocRef);

        if (courseDocSnap.exists()) {
          setCourse(courseDocSnap.data());
          
          // Check for an associated quiz
          const quizzesQuery = query(collection(db, 'quizzes'), where('courseId', '==', courseId));
          const unsubscribeQuiz = onSnapshot(quizzesQuery, (snapshot) => {
            if (!snapshot.empty) {
              setQuizId(snapshot.docs[0].id);
            } else {
              setQuizId(null);
            }
          });
          return () => unsubscribeQuiz();
        } else {
          setCourse(null);
        }
      };

      fetchCourseData();
    }
  }, [courseId]);

  // Fetch lessons for the course
  useEffect(() => {
    if (courseId) {
      const q = query(collection(db, `courses/${courseId}/lessons`));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const lessonsArray = [];
        querySnapshot.forEach((doc) => {
          lessonsArray.push({ id: doc.id, ...doc.data() });
        });
        setLessons(lessonsArray.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds));
      });
      return () => unsubscribe();
    }
  }, [courseId]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle || !newLessonContent) {
      setError('الرجاء إدخال عنوان ومحتوى للدرس.');
      return;
    }
    setFormLoading(true);
    setError('');

    try {
      await addDoc(collection(db, `courses/${courseId}/lessons`), {
        title: newLessonTitle,
        content: newLessonContent,
        createdAt: new Date(),
      });
      setNewLessonTitle('');
      setNewLessonContent('');
    } catch (err) {
      setError('فشل في إضافة الدرس. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (loading || !course) {
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
        <title>{course.title} - منصة التعليم</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800">{course.title}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            تسجيل الخروج
          </button>
        </header>

        {/* Course Details */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <p className="text-gray-700 mb-6">{course.description}</p>
          {quizId && (
            <Link href={`/quiz/${quizId}`} className="bg-green-500 text-white font-bold py-3 px-6 rounded-md hover:bg-green-600 transition duration-300">
              ابدأ الاختبار
            </Link>
          )}
        </div>

        {/* Teacher Functionality (Add Lesson) */}
        {userRole === 'teacher' && currentUser.uid === course.ownerId && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">إضافة درس جديد</h2>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="lessonTitle">
                  عنوان الدرس
                </label>
                <input
                  type="text"
                  id="lessonTitle"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="lessonContent">
                  محتوى الدرس
                </label>
                <textarea
                  id="lessonContent"
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  rows="6"
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
                {formLoading ? 'جاري الإضافة...' : 'إضافة الدرس'}
              </button>
            </form>
          </div>
        )}
        
        {/* Lessons List */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">الدروس</h2>
          {lessons.length === 0 ? (
            <p className="text-gray-500 text-center">لا توجد دروس في هذه الدورة حتى الآن.</p>
          ) : (
            lessons.map((lesson, index) => (
              <div key={lesson.id} className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
                <h3 className="text-xl font-bold text-blue-700 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{lesson.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
