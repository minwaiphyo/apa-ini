'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Programme {
  id: string
  name: string
}

interface FormField {
  id: string
  key: string
  label: string
  type: string
  required: boolean
  options?: string | null
  conditionalLogic?: string | null
  order: number
}

interface Activity {
  id: string
  title: string
  description: string | null
  programmeId: string
  startsAt: Date
  endsAt: Date
  location: string
  capacity: number
  volunteerRequired: number
  volunteerRatio: number
  tags: string[]
  accessibilityTags: string[]
  formTemplate?: {
    id: string
    fields: FormField[]
  } | null
}

interface ActivityFormProps {
  programmes: Programme[]
  activity?: Activity
}

export function ActivityForm({ programmes, activity }: ActivityFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    programmeId: activity?.programmeId || '',
    startsAt: activity ? new Date(activity.startsAt).toISOString().slice(0, 16) : '',
    endsAt: activity ? new Date(activity.endsAt).toISOString().slice(0, 16) : '',
    location: activity?.location || '',
    capacity: activity?.capacity || 20,
    volunteerRequired: activity?.volunteerRequired || 0,
    volunteerRatio: activity?.volunteerRatio || 5.0,
    tags: activity?.tags.join(', ') || '',
    accessibilityTags: activity?.accessibilityTags.join(', ') || '',
  })

  const [formFields, setFormFields] = useState<FormField[]>(
    activity?.formTemplate?.fields || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const accessibilityTags = formData.accessibilityTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        ...formData,
        tags,
        accessibilityTags,
        formFields: formFields.map((f) => ({
          key: f.key,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
          conditionalLogic: f.conditionalLogic,
          order: f.order,
        })),
      }

      const url = activity
        ? `/api/activities/${activity.id}`
        : '/api/activities'
      const method = activity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save activity')
      }

      router.push('/dashboard/staff/activities')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const addFormField = () => {
    setFormFields([
      ...formFields,
      {
        id: `temp-${Date.now()}`,
        key: '',
        label: '',
        type: 'text',
        required: false,
        order: formFields.length,
      },
    ])
  }

  const updateFormField = (index: number, updates: Partial<FormField>) => {
    const updated = [...formFields]
    updated[index] = { ...updated[index], ...updates }
    setFormFields(updated)
  }

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programme <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.programmeId}
            onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select programme...</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startsAt}
              onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volunteers Required
            </label>
            <input
              type="number"
              min="0"
              value={formData.volunteerRequired}
              onChange={(e) =>
                setFormData({ ...formData, volunteerRequired: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volunteer Ratio
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={formData.volunteerRatio}
              onChange={(e) =>
                setFormData({ ...formData, volunteerRatio: parseFloat(e.target.value) || 5.0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Participants per volunteer</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., Arts, Sports, Social"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accessibility Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.accessibilityTags}
            onChange={(e) => setFormData({ ...formData, accessibilityTags: e.target.value })}
            placeholder="e.g., Wheelchair-friendly, Hearing loop"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Registration Form Fields</h2>
          <button
            type="button"
            onClick={addFormField}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
          >
            + Add Field
          </button>
        </div>

        {formFields.length === 0 ? (
          <p className="text-gray-500 text-sm">No custom fields. Participants can register directly.</p>
        ) : (
          <div className="space-y-4">
            {formFields.map((field, index) => (
              <div key={field.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Field Key</label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => updateFormField(index, { key: e.target.value })}
                      placeholder="e.g., wheelchair_access"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateFormField(index, { label: e.target.value })}
                      placeholder="e.g., Do you need wheelchair access?"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateFormField(index, { type: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="boolean">Yes/No</option>
                      <option value="select">Select</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateFormField(index, { required: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs text-gray-700">Required</span>
                    </label>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => removeFormField(index)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
        </button>
      </div>
    </form>
  )
}
