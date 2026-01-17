"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { ConflictBanner } from "./ConflictBanner";

interface FormField {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  options?: string | null;
  conditionalLogic?: string | null;
}

interface FormTemplate {
  id: string;
  fields: FormField[];
}

interface Activity {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
}

interface RegistrationFormProps {
  activity: Activity;
  formTemplate: FormTemplate | null;
  userId: string;
  userRole: UserRole;
}

export function RegistrationForm({
  activity,
  formTemplate,
  userId,
  userRole,
}: RegistrationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{
    title: string;
    startsAt: Date;
    endsAt: Date;
  } | null>(null);

  useEffect(() => {
    // Prefill form data (could fetch from profile)
    if (formTemplate) {
      const initialData: Record<string, any> = {};
      formTemplate.fields.forEach((field) => {
        if (field.type === "boolean") {
          initialData[field.key] = false;
        } else if (field.type === "select") {
          initialData[field.key] = "";
        } else {
          initialData[field.key] = "";
        }
      });
      setFormData(initialData);
    }
  }, [formTemplate]);

  const visibleFields =
    formTemplate?.fields.filter((field) => {
      if (!field.conditionalLogic) return true;
      try {
        const logic = JSON.parse(field.conditionalLogic);
        if (logic.showIf) {
          const { field: conditionField, value: conditionValue } = logic.showIf;
          return formData[conditionField] === conditionValue;
        }
      } catch (e) {
        // Invalid JSON, show field
      }
      return true;
    }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setConflict(null);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId: activity.id,
          userId,
          userRole,
          answers: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.conflict) {
          setConflict({
            title: data.conflict.title,
            startsAt: new Date(data.conflict.startsAt),
            endsAt: new Date(data.conflict.endsAt),
          });
        } else {
          setError(data.error || "Failed to register");
        }
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      router.push(`/dashboard/`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (userRole === "VOLUNTEER") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-700 mb-4">
          Register as a volunteer for this activity.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Registering..." : "Register as Volunteer"}
        </button>
      </form>
    );
  }

  if (!formTemplate || formTemplate.fields.length === 0) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Registering..." : "Register for Activity"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {conflict && (
        <ConflictBanner
          conflictingActivity={conflict}
          onDismiss={() => setConflict(null)}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Registration Form
      </h3>

      {visibleFields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "boolean" && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData[field.key] || false}
                onChange={(e) =>
                  setFormData({ ...formData, [field.key]: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
          )}

          {field.type === "select" && (
            <select
              value={formData[field.key] || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {field.options &&
                JSON.parse(field.options).map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          )}

          {(field.type === "text" ||
            field.type === "email" ||
            field.type === "tel") && (
            <input
              type={field.type}
              value={formData[field.key] || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {field.type === "textarea" && (
            <textarea
              value={formData[field.key] || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              required={field.required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              value={formData[field.key] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field.key]: parseFloat(e.target.value) || 0,
                })
              }
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Registering..." : "Register for Activity"}
      </button>
    </form>
  );
}
