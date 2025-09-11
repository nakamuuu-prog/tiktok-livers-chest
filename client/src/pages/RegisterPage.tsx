import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Validation Schema
const schema = yup.object().shape({
  username: yup.string().required('ユーザー名は必須です'),
  password: yup.string().min(8, 'パスワードは8文字以上である必要があります').required('パスワードは必須です'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), undefined], 'パスワードが一致しません')
    .required('確認用パスワードは必須です'),
});

type FormData = yup.InferType<typeof schema>;

const RegisterPage = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signup(data.username, data.password);
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || '登録に失敗しました。もう一度お試しください。';
      setError('root.serverError', { type: 'custom', message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">アカウント登録</CardTitle>
          <CardDescription>
            ユーザー名とパスワードを設定して新しいアカウントを作成します。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {errors.root?.serverError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{errors.root.serverError.message}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">ユーザー名</Label>
              <Input id="username" type="text" {...register('username')} />
              {errors.username && (
                <p className='text-sm text-destructive'>{errors.username.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className='text-sm text-destructive'>{errors.password.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">パスワード (確認用)</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className='text-sm text-destructive'>{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '登録中...' : 'アカウント登録'}
            </Button>
            <div className="text-center text-sm">
              すでにアカウントをお持ちですか？{" "}
              <Link to="/login" className="underline">
                こちらからログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;