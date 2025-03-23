
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedTransition } from '@/components/AnimatedTransition';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { requestPasswordReset } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await requestPasswordReset(email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-muted/30">
        <AnimatedTransition variant="fadeIn" className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>
                Password reset instructions have been sent
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>. Please check your email inbox.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={() => setSuccess(false)}
                variant="outline"
                className="w-full"
              >
                Try Another Email
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
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
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
                    Sending Reset Link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <div className="text-center text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
              
              <div className="text-center text-sm">
                <Link to="/" className="text-muted-foreground hover:underline">
                  Back to home
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </AnimatedTransition>
    </div>
  );
};

export default ResetPassword;
