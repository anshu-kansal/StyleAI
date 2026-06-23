import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Trash2, ChevronDown, ChevronUp, Search, Plus, Award, Loader2 } from 'lucide-react';
import { Question, Answer } from '../../types';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { deleteQuestion, fetchQuestionAnswers } from '../../features/qa/qaSlice';
import { toast } from 'react-hot-toast';
import AnswerList from './AnswerList';
import AnswerForm from './AnswerForm';
import QuestionForm from './QuestionForm';

interface QuestionListProps {
  productId: string;
  questions: Question[];
  pagination: any;
  currentUserId?: string;
  isAdmin?: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  productId,
  questions,
  pagination,
  currentUserId,
  isAdmin,
  onPageChange,
  onSearchChange,
}) => {
  const dispatch = useAppDispatch();
  const { answers, answersLoading } = useAppSelector((state) => state.qa);

  const [searchVal, setSearchVal] = useState<string>('');
  const [showAskForm, setShowAskForm] = useState<boolean>(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchVal.trim());
  };

  const handleClearSearch = () => {
    setSearchVal('');
    onSearchChange('');
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question? This will delete all answers too.')) {
      const resultAction = await dispatch(deleteQuestion(questionId));
      if (deleteQuestion.fulfilled.match(resultAction)) {
        toast.success('Question deleted successfully');
      } else {
        toast.error('Failed to delete question');
      }
    }
  };

  const handleToggleExpandAnswers = async (questionId: string) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(questionId);
      // Fetch answers if not already loaded in Redux
      if (!answers[questionId]) {
        await dispatch(fetchQuestionAnswers({ questionId }));
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
    <div className="space-y-6">
      {/* Search and Ask Row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex items-center">
          <input
            type="text"
            placeholder="Search questions about this product..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <div className="absolute right-1 flex items-center gap-1">
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-1 rounded"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Ask Question Toggle button */}
        {currentUserId ? (
          <button
            onClick={() => setShowAskForm(!showAskForm)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-950 dark:border-white rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-sm hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Ask a Question</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-semibold self-center">
            Log in to ask questions about this product
          </span>
        )}
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <QuestionForm
          productId={productId}
          onSuccess={() => setShowAskForm(false)}
          onCancel={() => setShowAskForm(false)}
        />
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <HelpCircle className="h-8 w-8 text-slate-350 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {searchVal
              ? 'No questions matched your search query.'
              : 'No questions have been asked yet. Be the first!'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-6">
          {questions.map((q) => {
            const isQuestionOwner = q.user?._id === currentUserId;
            const hasAnswers = q.answersCount > 0;
            const isExpanded = expandedQuestionId === q._id;
            const isAnswering = answeringQuestionId === q._id;

            return (
              <div key={q._id} className="pt-6 first:pt-0 space-y-4">
                {/* Question Row: Title, User, Badge, Date */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {q.content}
                      </h4>
                    </div>

                    {(isQuestionOwner || isAdmin) && (
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-1 hover:text-rose-600 text-slate-450 rounded hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-450 font-semibold pl-7">
                    <span>Asked by {q.user?.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{formatDate(q.createdAt)}</span>
                  </div>
                </div>

                {/* Inline Top Answer Block */}
                {!isExpanded && q.topAnswer && (
                  <div className="pl-7 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                      <MessageSquare className="h-3 w-3 text-slate-400" />
                      <span>Top Answer:</span>
                      {q.topAnswer.isBestAnswer && (
                        <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 font-bold">
                          <Award className="h-2.5 w-2.5" />
                          Best Answer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap font-medium">
                      {q.topAnswer.content}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-slate-450 font-semibold">
                      <span>By {q.topAnswer.user?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{q.topAnswer.likesCount || 0} found this helpful</span>
                    </div>
                  </div>
                )}

                {/* Expanded answers lists */}
                {isExpanded && (
                  <div className="pl-7">
                    {answersLoading[q._id] ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-450" />
                        <span>Loading answers...</span>
                      </div>
                    ) : (
                      <AnswerList
                        questionId={q._id}
                        answers={answers[q._id] || []}
                        isQuestionOwner={isQuestionOwner}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                      />
                    )}
                  </div>
                )}

                {/* Answers Trigger buttons and answering options */}
                <div className="flex flex-wrap items-center gap-4 pl-7 text-[11px] font-bold text-slate-500">
                  {/* View Answers toggle trigger */}
                  {hasAnswers && (
                    <button
                      onClick={() => handleToggleExpandAnswers(q._id)}
                      className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer select-none"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          <span>Hide Answers</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          <span>View all {q.answersCount} {q.answersCount === 1 ? 'answer' : 'answers'}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Answer form trigger button */}
                  {currentUserId && (
                    <button
                      onClick={() => setAnsweringQuestionId(isAnswering ? null : q._id)}
                      className="hover:text-indigo-600 cursor-pointer select-none"
                    >
                      Answer this question
                    </button>
                  )}
                </div>

                {/* Inline Answer Posting Form */}
                {isAnswering && (
                  <div className="pl-7">
                    <AnswerForm
                      questionId={q._id}
                      onSuccess={() => {
                        setAnsweringQuestionId(null);
                        setExpandedQuestionId(q._id); // Expand answers to show the new one
                        dispatch(fetchQuestionAnswers({ questionId: q._id }));
                      }}
                      onCancel={() => setAnsweringQuestionId(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
          {Array.from({ length: pagination.totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 text-xs font-semibold rounded-lg border transition ${
                  pagination.page === pageNum
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400'
                } cursor-pointer`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
