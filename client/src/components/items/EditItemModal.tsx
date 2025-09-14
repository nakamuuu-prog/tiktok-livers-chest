import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BattleItem, ItemType } from '../../services/battleItems.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface EditItemModalProps {
  item: BattleItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { itemType: ItemType; expiryDate: string }) => void;
  isUpdating: boolean;
}

const itemTranslations: { [key in ItemType]: string } = {
  [ItemType.GLOVE]: 'グローブ',
  [ItemType.STUN_HAMMER]: 'スタンハンマー',
  [ItemType.MIST]: 'ミスト',
  [ItemType.TIME]: 'タイム',
  [ItemType.SECOND_BOOSTER]: '2位ブースター',
  [ItemType.THIRD_BOOSTER]: '3位ブースター',
};

const schema = yup.object().shape({
  itemType: yup
    .string()
    .oneOf(Object.values(ItemType))
    .required('アイテムは必須です'),
  expiryDate: yup.string().required('有効期限日は必須です'),
  expiryHour: yup
    .number()
    .min(0, '0以上の値を入力してください')
    .max(23, '23以下の値を入力してください')
    .required('有効期限時刻は必須です'),
});

interface FormData {
  itemType: ItemType;
  expiryDate: string;
  expiryHour: number;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  isUpdating,
}) => {
  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      itemType: item.itemType,
      expiryDate: (() => {
        const d = new Date(item.expiryDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(d.getDate()).padStart(2, '0')}`;
      })(),
      expiryHour: new Date(item.expiryDate).getHours(),
    },
  });

  const onSubmit = (data: FormData) => {
    const combinedDate = new Date(data.expiryDate);
    const originalMinutes = new Date(item.expiryDate).getMinutes();
    combinedDate.setHours(data.expiryHour, originalMinutes, 0, 0);
    onUpdate({
      itemType: data.itemType,
      expiryDate: combinedDate.toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-md'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          バトルアイテムを編集
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='itemType'
              render={({ field }) => (
                <FormItem>
                  <Label>アイテム</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='アイテムを選択...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ItemType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {itemTranslations[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex gap-2'>
              <div className='flex-grow'>
                <FormField
                  control={form.control}
                  name='expiryDate'
                  render={({ field }) => (
                    <FormItem>
                      <Label>有効期限</Label>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='w-1/3'>
                <FormField
                  control={form.control}
                  name='expiryHour'
                  render={({ field }) => (
                    <FormItem>
                      <Label>時刻</Label>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(parseInt(val, 10))
                        }
                        defaultValue={
                          field.value !== undefined
                            ? String(field.value)
                            : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='時' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='flex justify-end gap-4 mt-6'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                キャンセル
              </button>
              <button
                type='submit'
                disabled={isUpdating}
                className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50'
              >
                {isUpdating ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditItemModal;
