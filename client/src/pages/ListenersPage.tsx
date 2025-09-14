import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import listenerService, { Listener } from '../services/listeners.service';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ListenerListItem from '../components/listeners/ListenerListItem';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../components/ui/form';

// Form validation schema
const schema = yup.object().shape({
  name: yup.string().required('リスナー名は必須です。'),
});

interface IFormInput {
  name: string;
}

const ListenersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: listeners, isLoading } = useQuery({
    queryKey: ['listeners'],
    queryFn: listenerService.getListeners,
    select: res => res.data,
  });

  const mutation = useMutation({
    mutationFn: (name: string) => listenerService.createListener(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listeners'] });
      form.reset({ name: '' });
    },
  });

  const form = useForm<IFormInput>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: IFormInput) => {
    mutation.mutate(data.name);
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>リスナー管理</h1>
          <p className='text-muted-foreground'>
            アイテムを管理するリスナーの登録・編集・削除を行います。
          </p>
        </div>
      </div>

      {/* Add Listener Form */}
      <Card>
        <CardHeader>
          <CardTitle>新しいリスナーを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start space-x-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="リスナー名を入力..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? '追加中...' : '追加'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Listeners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {listeners && listeners.length > 0 ? (
          listeners.map((listener: Listener) => (
            <ListenerListItem key={listener.id} listener={listener} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">リスナーが登録されていません。</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ListenersPage;