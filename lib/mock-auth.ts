// Mock authentication system untuk presentasi
// Tidak menggunakan database/supabase asli

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isGuest?: boolean;
}

class MockAuth {
  private currentUser: MockUser | null = null;
  private isInitialized = false;

  // Initialize mock auth
  async initialize(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
    this.isInitialized = true;

    // Check if user exists in localStorage (for demo persistence)
    const savedUser = localStorage.getItem("mock_auth_user");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // Mock sign in with email/password
  async signInWithPassword(email: string, password: string): Promise<MockUser> {
    await this.initialize();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Fixed demo credentials (for presentation)
    const demoUsers = [
      { email: "demo@example.com", password: "demo123", name: "Demo User" },
      { email: "test@test.com", password: "test123", name: "Test User" },
      { email: "user@example.com", password: "password", name: "Example User" },
    ];

    const user = demoUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    this.currentUser = {
      id: `user_${Date.now()}`,
      email: user.email,
      name: user.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
    };

    // Save to localStorage for persistence
    localStorage.setItem("mock_auth_user", JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  // Mock sign up
  async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<MockUser> {
    await this.initialize();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.currentUser = {
      id: `user_${Date.now()}`,
      email,
      name: fullName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    // Save to localStorage for persistence
    localStorage.setItem("mock_auth_user", JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  // Mock Google sign in
  async signInWithGoogle(): Promise<void> {
    await this.initialize();

    // Simulate redirect to Google
    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.currentUser = {
      id: `google_user_${Date.now()}`,
      email: "google.user@example.com",
      name: "Google User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
    };

    // Save to localStorage for persistence
    localStorage.setItem("mock_auth_user", JSON.stringify(this.currentUser));

    // In a real app, we would redirect back to the app
    // For mock, we'll just simulate success
  }

  // Mock guest login
  async signInAsGuest(): Promise<MockUser> {
    await this.initialize();

    await new Promise((resolve) => setTimeout(resolve, 300));

    this.currentUser = {
      id: `guest_${Date.now()}`,
      email: "guest@example.com",
      name: "Guest User",
      isGuest: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
    };

    // Save to localStorage for persistence
    localStorage.setItem("mock_auth_user", JSON.stringify(this.currentUser));
    localStorage.setItem("guest_mode", "true");

    return this.currentUser;
  }

  // Get current session
  async getSession(): Promise<{ user: MockUser | null }> {
    await this.initialize();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      user: this.currentUser,
    };
  }

  // Mock sign out
  async signOut(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.currentUser = null;
    localStorage.removeItem("mock_auth_user");
    localStorage.removeItem("guest_mode");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  // Reset mock auth (for testing)
  reset(): void {
    this.currentUser = null;
    this.isInitialized = false;
    localStorage.removeItem("mock_auth_user");
    localStorage.removeItem("guest_mode");
  }
}

// Create singleton instance
export const mockAuth = new MockAuth();

// Export functions compatible with your existing code
export const signInWithEmail = mockAuth.signInWithPassword.bind(mockAuth);
export const signUpWithEmail = mockAuth.signUp.bind(mockAuth);
export const signInWithGoogle = mockAuth.signInWithGoogle.bind(mockAuth);
export const signOut = mockAuth.signOut.bind(mockAuth);
export const getSession = mockAuth.getSession.bind(mockAuth);
export const getCurrentUser = mockAuth.getCurrentUser.bind(mockAuth);
