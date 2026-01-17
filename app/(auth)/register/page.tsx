"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { UserRole as Role, MembershipTier } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("PARTICIPANT");

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipTier, setMembershipTier] =
    useState<MembershipTier>("AD_HOC");

  // Participant-specific fields
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [medicalStatus, setMedicalStatus] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");

  // Arrays
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (role === "PARTICIPANT" && !caregiverPhone) {
      setError("Caregiver phone is required for participants");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          name,
          phone,
          membershipTier,
          caregiverPhone: role === "PARTICIPANT" ? caregiverPhone : null,
          medicalStatus: role === "PARTICIPANT" ? medicalStatus : null,
          medicalHistory: role === "PARTICIPANT" ? medicalHistory : null,
          emergencyContactName:
            role === "PARTICIPANT" ? emergencyContactName : null,
          emergencyContactPhone:
            role === "PARTICIPANT" ? emergencyContactPhone : null,
          emergencyNotes: role === "PARTICIPANT" ? emergencyNotes : null,
          accessibilityNeeds,
          skills: role === "VOLUNTEER" ? skills : [],
          interests: role === "VOLUNTEER" ? interests : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("Auto-login failed:", signInResult.error);
        // Registration succeeded but login failed - redirect to login
        router.push("/login?registered=true");
        return;
      }

      // Success - redirect to role-based dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (
    array: string[],
    setArray: (arr: string[]) => void,
    item: string,
  ) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create your MindsHub account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am registering as a
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["PARTICIPANT", "VOLUNTEER", "STAFF"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    role === r
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+65 1234 5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Participant-Specific Fields */}
          {role === "PARTICIPANT" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Participant Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Tier *
                  </label>
                  <select
                    value={membershipTier}
                    onChange={(e) =>
                      setMembershipTier(e.target.value as MembershipTier)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AD_HOC">Ad-hoc</option>
                    <option value="ONE_PER_WEEK">Once per week</option>
                    <option value="TWO_PER_WEEK">Twice per week</option>
                    <option value="THREE_PLUS_PER_WEEK">
                      3+ times per week
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="caregiverPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Caregiver Phone Number *
                  </label>
                  <input
                    id="caregiverPhone"
                    type="tel"
                    required
                    value={caregiverPhone}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    placeholder="+65 8765 4321"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used to send event information to your caregiver
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="medicalStatus"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Medical Status
                  </label>
                  <input
                    id="medicalStatus"
                    type="text"
                    value={medicalStatus}
                    onChange={(e) => setMedicalStatus(e.target.value)}
                    placeholder="Brief summary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="medicalHistory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="emergencyContactName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Emergency Contact Name
                  </label>
                  <input
                    id="emergencyContactName"
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="emergencyContactPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Emergency Contact Phone
                  </label>
                  <input
                    id="emergencyContactPhone"
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="emergencyNotes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Emergency Notes
                  </label>
                  <textarea
                    id="emergencyNotes"
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Needs (All roles) */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Accessibility Needs
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "wheelchair",
                "hearing_aid",
                "visual_aid",
                "mobility_support",
              ].map((need) => (
                <button
                  key={need}
                  type="button"
                  onClick={() =>
                    toggleArrayItem(
                      accessibilityNeeds,
                      setAccessibilityNeeds,
                      need,
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    accessibilityNeeds.includes(need)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {need.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Volunteer-Specific Fields */}
          {role === "VOLUNTEER" && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "first_aid",
                    "cooking",
                    "arts_crafts",
                    "sports",
                    "music",
                    "teaching",
                  ].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleArrayItem(skills, setSkills, skill)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        skills.includes(skill)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {skill.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "wellness",
                    "recreation",
                    "education",
                    "social",
                    "events",
                  ].map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        toggleArrayItem(interests, setInterests, interest)
                      }
                      className={`px-3 py-1 rounded-full text-sm ${
                        interests.includes(interest)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
