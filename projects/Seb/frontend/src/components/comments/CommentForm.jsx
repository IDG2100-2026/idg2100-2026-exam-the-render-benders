import { useState } from "react";
import style from "./styles/CommentForm.module.css";

const MAX_COMMENT_LENGTH = 1000;

export default function CommentForm({ onSubmit, isSubmitting = false }) {
    const [content, setContent] = useState("");

    function handleChange(event) {
        const nextValue = event.target.value.slice(0, MAX_COMMENT_LENGTH);
        setContent(nextValue);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedContent = content.trim();
        if (!trimmedContent || isSubmitting) return;

        const wasSuccessful = await onSubmit(trimmedContent);

        if (wasSuccessful) {
            setContent("");
        }
    }

    return (
        <form className={style["commentForm"]} onSubmit={handleSubmit}>
            <label className={style["label"]} htmlFor="commentContent">
                Add Comment
            </label>

            <textarea
                id="commentContent"
                name="commentContent"
                value={content}
                onChange={handleChange}
                className={style["textarea"]}
                placeholder="Write a comment about the match..."
                maxLength={MAX_COMMENT_LENGTH}
                rows={5}
            />

            <div className={style["formFooter"]}>
                <p className={style["charCount"]}>
                    {content.length}/{MAX_COMMENT_LENGTH}
                </p>

                <button type="submit" className={style["submitButton"]} disabled={isSubmitting || !content.trim()}>
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            </div>
        </form>
    );
}