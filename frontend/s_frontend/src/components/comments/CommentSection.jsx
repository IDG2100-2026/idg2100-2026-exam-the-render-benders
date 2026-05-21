import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
	getGameComments,
	postComment,
	deleteComment
} from '@/services/commentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import CommentForm from './CommentForm';
import style from './styles/CommentSection.module.css';

function formatAuthor(comment) {
	if (typeof comment?.author === 'string') {
		return comment.author;
	}

	return (
		comment?.author?.username ||
		comment?.author?.displayName ||
		comment?.author?.name ||
		comment?.user?.username ||
		comment?.user?.displayName ||
		comment?.user?.name ||
		comment?.username ||
		'Anonymous'
	);
}

function formatDate(dateValue) {
	if (!dateValue) return 'Unknown date';

	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return 'Unknown date';

	return date.toLocaleString();
}

export default function CommentSection({ gameId }) {
	const { user } = useAuth();

	const [comments, setComments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	const fetchComments = useCallback(async () => {
		if (!gameId) return;

		setIsLoading(true);
		setError('');

		try {
			const response = await getGameComments(gameId);
			const normalizedComments = Array.isArray(response)
				? response
				: Array.isArray(response?.data)
					? response.data
					: [];

			setComments(normalizedComments);
		} catch (err) {
			setError(err?.message || 'Failed to load comments.');
		} finally {
			setIsLoading(false);
		}
	}, [gameId]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	async function handlePostComment(content) {
		const userId = user?._id || user?.id;

		if (!userId) {
			setError('You must be logged in to post comments.');
			return false;
		}

		setIsSubmitting(true);
		setError('');

		try {
			await postComment(
				gameId,
				{
					author: userId,
					content
				},
				'registered',
				userId
			);

			await fetchComments();
			return true;
		} catch (err) {
			setError(err?.message || 'Failed to post comment.');
			return false;
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteComment(commentId) {
		const userId = user?._id || user?.id;
		if (!userId) return;

		try {
			await deleteComment(commentId, 'registered', userId);
			await fetchComments();
		} catch (err) {
			setError(err?.message || 'Failed to delete comment.');
		}
	}

	return (
		<section className={style['commentSection']}>
			<div className={style['header']}>
				<h2 className={style['title']}>Comments</h2>
				<p className={style['subtitle']}>
					Discuss the match and react to what is happening.
				</p>
			</div>

			{error ? <ErrorMessage message={error} /> : null}

			<CommentForm
				onSubmit={handlePostComment}
				isSubmitting={isSubmitting}
			/>

			{isLoading ? (
				<div className={style['loadingWrapper']}>
					<LoadingSpinner />
				</div>
			) : comments.length ? (
				<div className={style['commentList']}>
					{comments.map((comment) => {
						const commentId = comment?._id || comment?.id;
						const authorId =
							comment?.author?._id ||
							comment?.author?.id ||
							comment?.user?._id ||
							comment?.user?.id ||
							comment?.userId;
						const currentUserId = user?._id || user?.id;
						const canDelete =
							Boolean(currentUserId) &&
							String(authorId) === String(currentUserId);

						return (
							<article
								key={commentId}
								className={style['commentCard']}
							>
								<div className={style['commentTop']}>
									<div>
										<p className={style['author']}>
											{formatAuthor(comment)}
										</p>
										<p className={style['date']}>
											{formatDate(
												comment?.createdAt ||
													comment?.dateCreated
											)}
										</p>
									</div>

									{canDelete ? (
										<button
											type="button"
											className={style['deleteButton']}
											onClick={() =>
												handleDeleteComment(commentId)
											}
										>
											Delete
										</button>
									) : null}
								</div>

								<p className={style['content']}>
									{comment?.content || ''}
								</p>
							</article>
						);
					})}
				</div>
			) : (
				<div className={style['emptyState']}>
					<p>No comments yet.</p>
				</div>
			)}
		</section>
	);
}
