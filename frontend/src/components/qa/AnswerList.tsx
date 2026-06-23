import React from 'react';
import { ThumbsUp, Trash2, Award, ShieldAlert, BadgeCheck } from 'lucide-react';
import { Answer } from '../../types';
import { useAppDispatch } from '../../app/store';
import { toggleLikeAnswer, toggleBestAnswer, deleteAnswer } from '../../features/qa/qaSlice';
import { toast } from 'react-hot-toast';

interface AnswerListProps {
  questionId: string;
  answers: Answer[];
  isQuestionOwner: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}

export const AnswerList: React.FC<AnswerListProps> = ({
  questionId,
  answers,
  isQuestionOwner,
  currentUserId,
  isAdmin,
}) => {
  const dispatch = useAppDispatch();

  const handleLike = async (answerId: string) => {
    if (!currentUserId) {
      toast.error('Please log in to upvote answers');
      return;
    }
    await dispatch(toggleLikeAnswer({ answerId, questionId }));
  };

  const handleBest = async (answerId: string) => {
    const resultAction = await dispatch(toggleBestAnswer({ answerId, questionId }));
    if (toggleBestAnswer.fulfilled.match(resultAction)) {
      toast.success(
        resultAction.payload.isBestAnswer
          ? 'Marked as best answer!'
          : 'Unmarked best answer'
      );
    } else {
      toast.error((resultAction.payload as string) || 'Failed to toggle best answer');
    }
  };

  const handleDelete = async (answerId: string) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      const resultAction = await dispatch(deleteAnswer({ answerId, questionId }));
      if (deleteAnswer.fulfilled.match(resultAction)) {
        toast.success('Answer deleted successfully');
      } else {
        toast.error('Failed to delete answer');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3.5 mt-3 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
      {answers.map((answer) => {
        const isAuthor = answer.user?._id === currentUserId;
        const hasLiked = currentUserId && answer.likes?.includes(currentUserId);
        
        return (
          <div
            key={answer._id}
            className={`p-3 rounded-lg border transition duration-300 ${
              answer.isBestAnswer
                ? 'border-emerald-500/35 bg-emerald-50/10 dark:bg-emerald-950/5'
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/10'
            }`}
          >
            {/* Header: Author info, Badges, and Best Answer Label */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {answer.user?.name || 'Anonymous'}
                </span>
                
                {/* Author Badge */}
                {answer.userRole === 'ADMIN' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 font-bold">
                    <ShieldAlert className="h-2.5 w-2.5" />
                    Admin
                  </span>
                )}
                {answer.userRole === 'SELLER' && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold">
                    <BadgeCheck className="h-2.5 w-2.5" />
                    Staff
                  </span>
                )}

                {/* Best Answer Badge */}
                {answer.isBestAnswer && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 font-extrabold">
                    <Award className="h-2.5 w-2.5" />
                    Best Answer
                  </span>
                )}
              </div>

              <span className="text-slate-400 dark:text-slate-500 font-medium">
                {formatDate(answer.createdAt)}
              </span>
            </div>

            {/* Answer Content */}
            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap mb-2 font-medium">
              {answer.content}
            </p>

            {/* Actions: Helpful count, Mark Best, and Delete */}
            <div className="flex items-center justify-between text-[10px]">
              <button
                onClick={() => handleLike(answer._id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition border cursor-pointer select-none ${
                  hasLiked
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-500 font-bold'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                <span>Helpful ({answer.likesCount || 0})</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Mark as Best Answer (Question creator or Admin) */}
                {(isQuestionOwner || isAdmin) && (
                  <button
                    onClick={() => handleBest(answer._id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer border ${
                      answer.isBestAnswer
                        ? 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        : 'border-emerald-200 hover:bg-emerald-50 dark:border-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <Award className="h-3 w-3" />
                    <span>{answer.isBestAnswer ? 'Unmark Best' : 'Mark Best'}</span>
                  </button>
                )}

                {/* Delete button (Author or Admin) */}
                {(isAuthor || isAdmin) && (
                  <button
                    onClick={() => handleDelete(answer._id)}
                    className="p-1 hover:text-rose-600 text-slate-400 cursor-pointer rounded hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnswerList;
