import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { submitReview } from '../../features/review/reviewSlice';
import { toast } from 'react-hot-toast';
import { Review } from '../../types';

interface ReviewFormProps {
  productId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

interface FormInputs {
  rating: number;
  comment: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.review);
  
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(existingReview?.images || []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || '',
    },
  });

  // Keep form in sync if existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setValue('rating', existingReview.rating);
      setValue('comment', existingReview.comment);
      setExistingImages(existingReview.images || []);
    } else {
      setRating(0);
      setValue('rating', 0);
      setValue('comment', '');
      setExistingImages([]);
    }
    // Clear temp files
    setSelectedFiles([]);
    setPreviewUrls([]);
  }, [existingReview, setValue]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    setValue('rating', selectedRating, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImagesCount = files.length + selectedFiles.length + existingImages.length;

    if (totalImagesCount > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    // Filter file types and sizes (<5MB)
    const validFiles: File[] = [];
    const newUrls: string[] = [];

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (!isLt5M) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitForm = async (data: FormInputs) => {
    if (data.rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    const formData = new FormData();
    formData.append('rating', String(data.rating));
    formData.append('comment', data.comment);

    // Append new uploaded files
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Append remaining existing images
    formData.append('images', JSON.stringify(existingImages));

    const resultAction = await dispatch(submitReview({ productId, formData }));
    
    if (submitReview.fulfilled.match(resultAction)) {
      toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      // Reset form if creating new review
      if (!existingReview) {
        reset();
        setRating(0);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setExistingImages([]);
      }
      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast.error((resultAction.payload as string) || 'Submission failed');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Share your experience with this product to help others make a choice.
        </p>
      </div>

      {/* Star Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Your Rating <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform active:scale-95"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              {rating === 5
                ? 'Excellent!'
                : rating === 4
                ? 'Very Good'
                : rating === 3
                ? 'Average'
                : rating === 2
                ? 'Poor'
                : 'Terrible'}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-xs text-rose-500 font-medium">{errors.rating.message}</p>
        )}
      </div>

      {/* Comment Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Your Review <span className="text-rose-500">*</span>
        </label>
        <textarea
          {...register('comment', {
            required: 'Please write a comment',
            minLength: {
              value: 3,
              message: 'Comment must be at least 3 characters long',
            },
            maxLength: {
              value: 1000,
              message: 'Comment cannot exceed 1000 characters',
            },
          })}
          rows={4}
          placeholder="What did you like or dislike? How does it fit?"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-slate-900 dark:text-white"
        />
        {errors.comment && (
          <p className="text-xs text-rose-500 font-medium">{errors.comment.message}</p>
        )}
      </div>

      {/* Image Upload Row */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Add Photos <span className="text-slate-400 font-normal">(Optional, up to 5)</span>
        </label>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* File input button */}
          {(previewUrls.length + existingImages.length) < 5 && (
            <label className="flex flex-col items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer bg-slate-50 dark:bg-slate-900 transition">
              <Camera className="h-6 w-6 text-slate-400 hover:text-indigo-500" />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">Upload</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* Existing uploaded images (editing mode) */}
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src={url} alt="Review attachment" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* New file previews */}
          {previewUrls.map((url, index) => (
            <div key={`preview-${index}`} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src={url} alt="Review preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeSelectedFile(index)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : existingReview ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
