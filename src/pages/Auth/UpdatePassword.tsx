
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedTransition } from '@/components/AnimatedTransition';

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { resetPassword, user } = useAuth();
  const navigate = useNavigate();
  
  // Check if we have access token in URL (from email link)
  useEffect(() => {
    // Supabase automatically handles the token in the URL
    // The auth state will be updated once the token is processed
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate inputs
    if (!password || !confirmPassword) {
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
      const { error } = await resetPassword(password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/login', { 
          state: { message: 'Password updated successfully. Please log in with your new password.' } 
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // If no user is detected, show an error
  if (!user && !loading) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-muted/30">
        <AnimatedTransition variant="fadeIn" className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
              <CardDescription>
                This password reset link may be invalid or expired
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Please request a new password reset link.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={() => navigate('/reset-password')}
                className="w-full"
              >
                Request New Reset Link
              </Button>
              
              <div className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Login
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
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating Password...
                  </span>
                ) : (
                  'Update Password'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </AnimatedTransition>
    </div>
  );
};

export default UpdatePassword;
