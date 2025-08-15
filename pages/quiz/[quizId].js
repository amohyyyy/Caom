
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../components/AuthContext';
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';
import Link from 'next/link';

const auth = getAuth(app);
const db = getFirestore(app);

const QuizPage = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const { currentUser, userRole, loading } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStatus, setQuizStatus] = useState('loading'); // loading, inProgress, completed, notFound
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  // Fetch quiz and questions data
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      setQuizStatus('loading');
      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizDocSnap = await getDoc(quizDocRef);

      if (quizDocSnap.exists()) {
        setQuiz(quizDocSnap.data());
        
        const questionsCollectionRef = collection(db, `quizzes/${quizId}/questions`);
        const questionsQuery = query(questionsCollectionRef, orderBy('order', 'asc'));
        const questionsSnapshot = await getDocs(questionsQuery);
        const questionsArray = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setQuestions(questionsArray);
        setQuizStatus('inProgress');
        setTimeLeft(questionsArray[0]?.timer || 30); // Start timer for the first question
      } else {
        setQuizStatus('notFound');
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Per-question timer logic
  useEffect(() => {
    if (quizStatus === 'inProgress' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (quizStatus === 'inProgress' && timeLeft === 0) {
      handleNextQuestion();
    }
  }, [quizStatus, timeLeft, currentQuestionIndex, questions]);

  const handleAnswerSelect = (option) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: option,
    });
  };

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimeLeft(questions[nextQuestionIndex]?.timer || 30);
    } else {
      calculateAndSubmitScore();
    }
  };

  const calculateAndSubmitScore = async () => {
    let finalScore = 0;
    const answeredQuestions = Object.keys(userAnswers);

    questions.forEach((question, index) => {
      if (userAnswers[index] && userAnswers[index] === question.correctAnswer) {
        finalScore += 1;
      }
    });

    setScore(finalScore);

    // Submit attempt to Firestore
    if (currentUser) {
      try {
        await addDoc(collection(db, 'attempts'), {
          userId: currentUser.uid,
          quizId: quizId,
          score: finalScore,
          totalQuestions: questions.length,
          userAnswers,
          createdAt: new Date(),
        });
      } catch (err) {
        console.error('Failed to save attempt:', err);
      }
    }
    
    setQuizStatus('completed');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };
  
  const currentQuestion = questions[currentQuestionIndex];

  if (loading || quizStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-bold text-gray-700">جاري تحميل الاختبار...</p>
      </div>
    );
  }

  if (quizStatus === 'notFound') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">الاختبار غير موجود.</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">
            العودة إلى لوحة التحكم
          </Link>
        </div>
      </div>
    );
  }
  
  if (quizStatus === 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <Head>
          <title>النتيجة - {quiz?.title}</title>
        </Head>
        <div className="bg-white rounded-xl shadow-md p-8 text-center w-full max-w-lg">
          <h1 className="text-3xl font-bold text-green-600 mb-4">اكتمل الاختبار!</h1>
          <p className="text-xl text-gray-700 mb-6">لقد حصلت على <span className="text-blue-600 font-bold">{score}</span> من <span className="font-bold">{questions.length}</span></p>
          <Link href="/dashboard" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300">
            العودة إلى لوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 md:p-16">
      <Head>
        <title>اختبار - {quiz?.title}</title>
      </Head>
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800">{quiz?.title}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            تسجيل الخروج
          </button>
        </header>
        
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              سؤال {currentQuestionIndex + 1} من {questions.length}
            </h2>
            <div className="text-lg font-bold text-red-600">
              الوقت المتبقي: {timeLeft} ثانية
            </div>
          </div>
          
          <p className="text-gray-700 text-xl font-semibold mb-6">{currentQuestion?.questionText}</p>
          
          <div className="space-y-4">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-right p-4 rounded-lg border-2 font-medium transition duration-300 ${
                  userAnswers[currentQuestionIndex] === option
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleNextQuestion}
            disabled={!userAnswers[currentQuestionIndex] && currentQuestionIndex + 1 < questions.length}
            className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
          >
            {currentQuestionIndex + 1 === questions.length ? 'إنهاء الاختبار' : 'السؤال التالي'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
