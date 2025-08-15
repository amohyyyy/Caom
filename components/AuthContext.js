
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { app } from '../lib/firebase';

const AuthContext = createContext();

const auth = getAuth(app);
const db = getFirestore(app);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData.role);
        } else {
          // This case should not happen if user is created correctly
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Protect routes based on role (optional, can be moved to individual pages)
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/', '/auth/login', '/auth/signup'];
      const isPublicPath = publicPaths.includes(router.pathname);

      if (!currentUser && !isPublicPath) {
        router.push('/auth/login');
      } else if (currentUser && router.pathname === '/auth/login') {
        router.push('/dashboard');
      }
    }
  }, [currentUser, loading, router]);

  const value = {
    currentUser,
    userRole,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
