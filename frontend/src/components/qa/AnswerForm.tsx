import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../app/store';
import { submitAnswer } from '../../features/qa/qaSlice';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface AnswerFormProps {
  questionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormInputs {
  content: string;
}

export const AnswerForm: React.FC<AnswerFormProps> = ({
  questionId,
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
    const resultAction = await dispatch(submitAnswer({ questionId, content: data.content }));
    
    if (submitAnswer.fulfilled.match(resultAction)) {
      toast.success('Answer posted successfully!');
      reset();
      if (onSuccess) onSuccess();
    } else {
      toast.error((resultAction.payload as string) || 'Failed to post answer');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-3 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg"
    >
      <div className="space-y-1">
        <textarea
          {...register('content', {
            required: 'Please enter your answer',
            minLength: {
              value: 10,
              message: 'Answer must be at least 10 characters long',
            },
            maxLength: {
              value: 1000,
              message: 'Answer cannot exceed 1000 characters',
            },
          })}
          rows={2}
          placeholder="Write your helpful answer here..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs text-slate-900 dark:text-white"
        />
        {errors.content && (
          <p className="text-[10px] text-rose-500 font-medium">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 text-[10px]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Answer'
          )}
        </button>
      </div>
    </form>
  );
};

export default AnswerForm;
