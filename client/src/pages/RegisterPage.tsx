import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">新規アカウント作成</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              パスワード（確認用）
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={`mt-1 block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          {errors.root?.serverError && (
            <p className="text-sm text-red-600 text-center">{errors.root.serverError.message}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          すでにアカウントをお持ちですか？{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            こちらからログイン
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
