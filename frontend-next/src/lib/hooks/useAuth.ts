import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated via localStorage
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin-auth');
      const loginTime = localStorage.getItem('admin-login-time');
      
      if (adminAuth === 'true' && loginTime) {
        // Check if login is not older than 24 hours
        const loginTimestamp = parseInt(loginTime);
        const now = Date.now();
        const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24) {
          setUser({ email: 'admin@tusgal.com' });
          setIsAdmin(true);
        } else {
          // Session expired
          localStorage.removeItem('admin-auth');
          localStorage.removeItem('admin-login-time');
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      localStorage.removeItem('admin-auth');
      localStorage.removeItem('admin-login-time');
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('SignOut error:', error);
      // Force clear state even if localStorage fails
      setUser(null);
      setIsAdmin(false);
    }
  };

  return {
    user,
    loading,
    isAdmin,
    signOut,
  };
} 