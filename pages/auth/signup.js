
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase'; // Ensure this path is correct

const auth = getAuth(app);
const db = getFirestore(app);

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore with a default role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'student', // Default role for new users
        createdAt: new Date(),
      });

      // Redirect to dashboard after successful signup
      router.push('/dashboard');
    } catch (err) {
      setError('فشل في إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً بالفعل.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>إنشاء حساب - منصة التعليم</title>
      </Head>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">إنشاء حساب جديد</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            هل لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              سجل الدخول من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
