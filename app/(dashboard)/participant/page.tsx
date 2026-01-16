
"use client";
import React from "react";

type UserRole = "PARTICIPANT" | "VOLUNTEER" | "STAFF";
type MembershipTier = "AD_HOC" | "ONE_PER_WEEK" | "TWO_PER_WEEK" | "THREE_PLUS_PER_WEEK";

type ProfileForm = {
  user: {
    email: string;     // User.email
    role: UserRole;    // User.role
  };
  profile: {
    name: string;                  // Profile.name
    phone?: string;                // Profile.phone
    membershipTier: MembershipTier;// Profile.membershipTier
    accessibilityNeeds: string[];  // Profile.accessibilityNeeds
    // skills/interests exist in schema but usually volunteer-only:
    skills: string[];
    interests: string[];
  };
};

const COLORS = {
  mint: "#8FD3C8",
  border: "#D6D6D6",
  textMuted: "rgba(0,0,0,0.65)",
  black: "#111",
  bg: "#fff",
};

export default function ParticipantProfilePage() {
  const [form, setForm] = React.useState<ProfileForm>({
    user: {
      email: "participant@example.com",
      role: "PARTICIPANT",
    },
    profile: {
      name: "Participant Name",
      phone: "+6591234567",
      membershipTier: "AD_HOC",
      accessibilityNeeds: ["Wheelchair-friendly", "Quiet space"],
      skills: [],
      interests: [],
    },
  });

  const [needInput, setNeedInput] = React.useState("");

  function updateProfile<K extends keyof ProfileForm["profile"]>(
    key: K,
    value: ProfileForm["profile"][K]
  ) {
    setForm((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginTop: 6,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    background: COLORS.bg,
    fontSize: 14,
    outline: "none",
  };

  const sectionStyle: React.CSSProperties = {
    marginTop: 16,
    padding: 16,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.black,
  };

  function membershipCardStyle(selected: boolean): React.CSSProperties {
    return {
      flex: 1,
      minWidth: 220,
      padding: 18,
      borderRadius: 12,
      border: selected ? `2px solid ${COLORS.mint}` : `1px solid ${COLORS.border}`,
      cursor: "pointer",
      background: "#fff",
      transition: "all 0.15s ease",
      display: "grid",
      gap: 10,
    };
  }

  function addAccessibilityNeed() {
    const v = needInput.trim();
    if (!v) return;
    if (form.profile.accessibilityNeeds.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setNeedInput("");
      return;
    }
    updateProfile("accessibilityNeeds", [...form.profile.accessibilityNeeds, v]);
    setNeedInput("");
  }

  function removeAccessibilityNeed(need: string) {
    updateProfile(
      "accessibilityNeeds",
      form.profile.accessibilityNeeds.filter((x) => x !== need)
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Participant Profile</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        This page matches your current Prisma schema (User + Profile).
      </p>

      {/* Read-only user info */}
      <section style={{ ...sectionStyle, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Account</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Email</div>
            <div style={{ fontWeight: 700 }}>{form.user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Role</div>
            <div style={{ fontWeight: 700 }}>{form.user.role}</div>
          </div>
        </div>
      </section>

      {/* Profile fields (Profile model) */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Basic Information</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <label style={labelStyle}>
            Name (Profile.name)
            <input
              value={form.profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Phone (Profile.phone)
            <input
              value={form.profile.phone ?? ""}
              onChange={(e) => updateProfile("phone", e.target.value || undefined)}
              style={inputStyle}
              placeholder="+6591234567"
            />
          </label>
        </div>
      </section>

      {/* Membership tier (Profile.membershipTier) */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Membership Tier</h2>
        <p style={{ marginTop: 6, color: COLORS.textMuted }}>
          Stored as <code>Profile.membershipTier</code> (enum).
        </p>

        <div style={{ marginTop: 12 }}>
          <div style={{ color: COLORS.mint, fontWeight: 900, fontSize: 18 }}>Cost</div>
          <div
            style={{
              height: 2,
              background: COLORS.mint,
              opacity: 0.7,
              marginTop: 8,
              borderRadius: 999,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => updateProfile("membershipTier", "AD_HOC")}
            style={membershipCardStyle(form.profile.membershipTier === "AD_HOC")}
          >
            <div style={{ textAlign: "center", fontWeight: 900, fontSize: 18 }}>
              AdHoc
              <br />
              Membership
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800 }}>$10</div>
            <div style={{ textAlign: "center", color: COLORS.textMuted, fontWeight: 700 }}>
              /session
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => updateProfile("membershipTier", "ONE_PER_WEEK")}
            style={membershipCardStyle(form.profile.membershipTier === "ONE_PER_WEEK")}
          >
            <div style={{ textAlign: "center", fontWeight: 900, fontSize: 18 }}>
              Regular
              <br />
              Membership
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800 }}>$150</div>
            <div style={{ textAlign: "center", color: COLORS.textMuted, fontWeight: 700 }}>
              per year (example)
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => updateProfile("membershipTier", "TWO_PER_WEEK")}
            style={membershipCardStyle(form.profile.membershipTier === "TWO_PER_WEEK")}
          >
            <div style={{ textAlign: "center", fontWeight: 900, fontSize: 18 }}>
              Two
              <br />
              per week
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800 }}>$100</div>
            <div style={{ textAlign: "center", color: COLORS.textMuted, fontWeight: 700 }}>
              /10 sessions (example)
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => updateProfile("membershipTier", "THREE_PLUS_PER_WEEK")}
            style={membershipCardStyle(form.profile.membershipTier === "THREE_PLUS_PER_WEEK")}
          >
            <div style={{ textAlign: "center", fontWeight: 900, fontSize: 18 }}>
              Three+
              <br />
              per week
            </div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800 }}>$25</div>
            <div style={{ textAlign: "center", color: COLORS.textMuted, fontWeight: 700 }}>
              /hour (example)
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontFamily: "monospace", opacity: 0.85 }}>
          membershipTier: "{form.profile.membershipTier}"
        </div>
      </section>

      {/* Accessibility needs (Profile.accessibilityNeeds: String[]) */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Accessibility Needs</h2>
        <p style={{ marginTop: 6, color: COLORS.textMuted }}>
          Stored as <code>Profile.accessibilityNeeds</code> (String[]).
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {form.profile.accessibilityNeeds.map((need) => (
            <span
              key={need}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
                background: "#fff",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {need}
              <button
                type="button"
                onClick={() => removeAccessibilityNeed(need)}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 999,
                  width: 22,
                  height: 22,
                  cursor: "pointer",
                  background: "#fff",
                  fontWeight: 900,
                }}
                aria-label={`Remove ${need}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <input
            value={needInput}
            onChange={(e) => setNeedInput(e.target.value)}
            style={{ ...inputStyle, flex: 1, marginTop: 0 }}
            placeholder="Add an accessibility need (e.g., wheelchair-friendly)"
            onKeyDown={(e) => e.key === "Enter" && addAccessibilityNeed()}
          />
          <button
            type="button"
            onClick={addAccessibilityNeed}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: "#111",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </section>

      {/* Debug */}
      <section style={{ ...sectionStyle, borderStyle: "dashed" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>Collected Data (Schema-Matched)</h2>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 10, fontSize: 12 }}>
{JSON.stringify(form, null, 2)}
        </pre>
      </section>
    </div>
  );
}
