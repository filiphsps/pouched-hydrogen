import { CheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { Textarea } from "~/components/textarea";
import { Title } from "~/components/title";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { RatingInput } from "./rating-input";

type FormState = "idle" | "submitting" | "success" | "error";

interface ReviewFormProps extends React.HTMLAttributes<HTMLDivElement> {
    showForm: boolean;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ReviewForm({
    showForm,
    setShowForm,
    className,
}: ReviewFormProps) {
    const { t } = useTranslation();
    const { product } = useLoaderData<typeof productRouteLoader>();
    const [rating, setRating] = useState(0);
    const [formState, setFormState] = useState<FormState>("idle");
    const formRef = useRef<HTMLFormElement>(null);
    const submitReviewAPI = usePrefixPathWithLocale(
        `/api/product/${product?.handle || ""}/reviews`,
    );

    function resetForm() {
        setRating(0);
        setFormState("idle");
        formRef.current?.reset();
    }

    async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        if (!product?.handle) {
            setFormState("error");
            return;
        }

        // Check if rating is selected first
        if (rating === 0) {
            alert(t("judgeme.form.ratingAlert"));
            return;
        }

        // Use native form validation for other fields
        if (!ev.currentTarget.checkValidity()) {
            return;
        }

        setFormState("submitting");
        fetch(submitReviewAPI, {
            method: "POST",
            body: new FormData(ev.currentTarget),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Response not ok");
                }
                return res.json() as Promise<{ review: unknown } | null>;
            })
            .then((data) => {
                if (data?.review) {
                    setFormState("success");
                } else {
                    throw new Error("Review submission failed");
                }
            })
            .catch((err) => {
                console.error("Error submitting review:", err);
                setFormState("error");
            });
    }

    return (
        <div
            className={cn(
                "w-full space-y-6 border border-gray-200 p-6 shadow transition-all duration-200 md:p-8",
                showForm ? "block" : "hidden",
                className,
            )}
        >
            <div
                className={cn(
                    "space-y-4 py-4 text-center",
                    formState === "success" ? "block" : "hidden",
                )}
                role="alert"
                aria-live="polite"
            >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <Title
                    as="h3"
                    size="xl"
                    className="mb-2 font-semibold text-green-900"
                >
                    {t("judgeme.form.success.title")}
                </Title>
                <p className="text-gray-600">
                    {t("judgeme.form.success.message")}
                </p>
                <Button type="button" onClick={resetForm} className="mt-4">
                    {t("judgeme.form.success.writeAnother")}
                </Button>
            </div>
            <div
                className={cn(
                    "space-y-4 py-4 text-center",
                    formState === "error" ? "block" : "hidden",
                )}
                role="alert"
                aria-live="polite"
            >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <WarningCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <Title
                    as="h3"
                    size="xl"
                    className="mb-2 font-semibold text-red-900"
                >
                    {t("judgeme.form.error.title")}
                </Title>
                <p className="text-gray-600">
                    {t("judgeme.form.error.message")}
                </p>
                <Button
                    type="button"
                    onClick={() => setFormState("idle")}
                    className="mt-4"
                >
                    {t("judgeme.form.error.tryAgain")}
                </Button>
            </div>
            <form
                ref={formRef}
                id="judgeme-review-form"
                onSubmit={handleSubmit}
                className={cn(
                    "space-y-6",
                    formState === "idle" || formState === "submitting"
                        ? "block"
                        : "hidden",
                )}
            >
                <div className="space-y-2">
                    <Title
                        as="h2"
                        size="2xl"
                        className="text-center font-bold text-gray-900"
                    >
                        {t("judgeme.form.writeReview.title")}
                    </Title>
                    <p className="text-center text-gray-600">
                        {t("judgeme.form.writeReview.subtitle")}
                    </p>
                </div>

                {/* Hidden product ID input */}
                {product?.id && (
                    <input
                        type="hidden"
                        name="id"
                        value={Number(product.id.split("/").pop())}
                    />
                )}

                {/* Rating */}
                <RatingInput
                    label={t("judgeme.form.fields.rating.label")}
                    required
                    name="rating"
                    rating={rating}
                    onRatingChange={setRating}
                />

                {/* Name */}
                <div className="space-y-2">
                    <label
                        htmlFor="judgeme-reviewer-name"
                        className="block font-medium text-gray-700 text-sm"
                    >
                        {t("judgeme.form.fields.name.label")}
                        <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                        variant="outline"
                        type="text"
                        name="name"
                        id="judgeme-reviewer-name"
                        defaultValue=""
                        placeholder={t("judgeme.form.fields.name.placeholder")}
                        required
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="judgeme-reviewer-email"
                        className="block font-medium text-gray-700 text-sm"
                    >
                        {t("judgeme.form.fields.email.label")}
                        <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                        variant="outline"
                        type="email"
                        name="email"
                        id="judgeme-reviewer-email"
                        defaultValue=""
                        placeholder={t("judgeme.form.fields.email.placeholder")}
                        required
                    />
                </div>

                {/* Review Title */}
                <div className="space-y-2">
                    <label
                        htmlFor="judgeme-review-title"
                        className="block font-medium text-gray-700 text-sm"
                    >
                        {t("judgeme.form.fields.title.label")}
                    </label>
                    <Input
                        variant="outline"
                        type="text"
                        name="title"
                        id="judgeme-review-title"
                        defaultValue=""
                        placeholder={t("judgeme.form.fields.title.placeholder")}
                    />
                </div>

                {/* Review Body */}
                <div className="space-y-2">
                    <label
                        htmlFor="judgeme-review-body"
                        className="block font-medium text-gray-700 text-sm"
                    >
                        {t("judgeme.form.fields.body.label")}
                        <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Textarea
                        variant="outline"
                        name="body"
                        id="judgeme-review-body"
                        defaultValue=""
                        required
                        placeholder={t("judgeme.form.fields.body.placeholder")}
                        rows={5}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowForm(false)}
                    >
                        {t("judgeme.form.buttons.cancel")}
                    </Button>
                    <Button type="submit" disabled={formState === "submitting"}>
                        {formState === "submitting"
                            ? t("judgeme.form.buttons.submitting")
                            : t("judgeme.form.buttons.submit")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
