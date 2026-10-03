import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, mobile: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<Role, User> = {
  customer: {
    id: 'user-001',
    name: 'Customer Demo',
    email: 'customer@voltcart.in',
    mobile: '9845098450',
    role: 'customer',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    totalOrders: 2,
    totalSpent: 3997,
  },
  admin: {
    id: 'admin-001',
    name: 'Store Administrator',
    email: 'admin@voltcart.in',
    mobile: '9845000000',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
  },
  delivery: {
    id: 'del-001',
    name: 'Ramesh Kumar (Delivery Executive)',
    email: 'delivery@voltcart.in',
    mobile: '9845012345',
    role: 'delivery',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('voltcart_auth_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.customer;
    } catch {
      return DEMO_USERS.customer;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('voltcart_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('voltcart_auth_user');
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();
    // Check credentials for admin
    if (trimmed.includes('admin') || trimmed === 'admin@voltcart.in') {
      setUser(DEMO_USERS.admin);
      return true;
    }
    if (trimmed.includes('delivery')) {
      setUser(DEMO_USERS.delivery);
      return true;
    }

    const customerUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      mobile: '9845098450',
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setUser(customerUser);
    return true;
  };

  const register = async (name: string, email: string, mobile: string): Promise<boolean> => {
    const newUser: User = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name,
      email,
      mobile,
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    setUser(DEMO_USERS[newRole]);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
