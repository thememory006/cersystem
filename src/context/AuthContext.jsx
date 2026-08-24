import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // เช็คว่า Firebase ถูกตั้งค่าหรือยัง ถ้ายังให้ใช้ระบบจำลอง
  const isFirebaseConfigured = !!auth;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // เช็คว่าอีเมลตรงกับรายชื่อ Admin หรือไม่
        const adminEmails = ['thememory003@gmail.com', 'thememory006@gmail.com'];
        const role = adminEmails.includes(firebaseUser.email) ? 'admin' : 'user';
        
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
          role: role,
        };
        
        setUser(userData);

        // Sync to D1 Backend (fire and forget)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        fetch(`${apiUrl}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar_url: firebaseUser.photoURL,
          }),
        }).catch(err => console.error("Sync user error:", err));
        
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      // Mock Login สำหรับตอนที่ยังไม่มี Firebase Config
      setUser({
        uid: 'mock-1234',
        name: 'แอดมิน (Mock)',
        email: 'admin@mock.com',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=1d4ed8&color=fff',
        role: 'admin'
      });
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error('การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
