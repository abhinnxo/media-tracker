
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { toast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // If user already exists, try to sign in
          const { error: signInError } = await signIn(email, password);
          if (signInError) {
            setError(signInError.message);
          } else {
            // Successfully logged in, redirect to onboarding
            navigate('/onboarding');
          }
        } else {
          setError(signUpError.message);
        }
      } else {
        // For development without email verification
        const { error: signInError } = await signIn(email, password);
        if (!signInError) {
          // Successfully registered and logged in, redirect to onboarding
          navigate('/onboarding');
        } else {
          // Regular success message for production with email verification
          setSuccess(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const AuthDivider = () => (
    <div className="flex items-center my-4">
      <div className="flex-1 border-t border-border"></div>
      <span className="px-4 text-sm text-muted-foreground">or</span>
      <div className="flex-1 border-t border-border"></div>
    </div>
  );
  
  if (success) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-muted/30">
        <AnimatedTransition variant="fadeIn" className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Registration Successful</CardTitle>
              <CardDescription>
                Please check your email to verify your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We've sent a verification email to <strong>{email}</strong>. Click the link in the email to activate your account.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
              
              <div className="text-center text-sm">
                <Link to="/" className="text-muted-foreground hover:underline">
                  Back to home
                </Link>
              </div>
            </CardFooter>
          </Card>
        </AnimatedTransition>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex items-center justify-center p-4 bg-muted/30">
      <AnimatedTransition variant="fadeIn" className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <GoogleSignInButton mode="signup" />
            
            <AuthDivider />
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </span>
                ) : (
                  'Register'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
            
            <div className="text-center text-sm">
              <Link to="/" className="text-muted-foreground hover:underline">
                Back to home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </AnimatedTransition>
    </div>
  );
};

export default Register;
