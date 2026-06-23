import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../app/store';
import { submitQuestion } from '../../features/qa/qaSlice';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface QuestionFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormInputs {
  content: string;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  productId,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmitForm = async (data: FormInputs) => {
    const resultAction = await dispatch(submitQuestion({ productId, content: data.content }));
    
    if (submitQuestion.fulfilled.match(resultAction)) {
      toast.success('Question posted successfully!');
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error((resultAction.payload as string) || 'Failed to post question');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-4 p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl"
    >
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Ask a question
        </label>
        <textarea
          {...register('content', {
            required: 'Please enter your question',
            minLength: {
              value: 10,
              message: 'Question must be at least 10 characters long',
            },
            maxLength: {
              value: 500,
              message: 'Question cannot exceed 500 characters',
            },
          })}
          rows={3}
          placeholder="For example: Does this run true to size? What is the fabric blend?"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-900 dark:text-white"
        />
        {errors.content && (
          <p className="text-xs text-rose-500 font-medium">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 text-xs">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Question'
          )}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
