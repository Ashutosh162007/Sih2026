import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  BookOpen,
  Save,
  Lock,
} from "lucide-react";
import { ROLE_LABELS, ROLES, JHARKHAND_DISTRICTS, DISCIPLINES } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";
import axiosClient from "../../api/axiosClient";

export default function UserProfile() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98351 00000");
  const [district, setDistrict] = useState(user?.district || user?.location?.district || "Ranchi");
  const [block, setBlock] = useState(user?.block || user?.location?.block || "Kanke");
  const [org, setOrg] = useState(user?.org || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedDisciplines, setSelectedDisciplines] = useState(user?.disciplines || []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "+91 98351 00000");
      setDistrict(user.district || user.location?.district || "Ranchi");
      setBlock(user.block || user.location?.block || "Kanke");
      setOrg(user.org || "");
      setBio(user.bio || "");
      setSelectedDisciplines(user.disciplines || []);
    }
  }, [user]);

  async function handleProfileSave(e) {
    e.preventDefault();
    setSaving(true);
    setProfileMsg("");
    try {
      const { data } = await axiosClient.put("/api/users/profile", {
        name,
        phone,
        district,
        block,
        org,
        bio,
        disciplines: selectedDisciplines,
      });
      if (data.user) {
        useAuthStore.setState({ user: data.user });
        localStorage.setItem("sahayog_user", JSON.stringify(data.user));
      }
      setProfileMsg("Profile details updated successfully!");
      setTimeout(() => setProfileMsg(""), 4000);
    } catch (err) {
      setProfileMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPassErr("");
    setPassMsg("");
    if (newPassword !== confirmPassword) {
      setPassErr("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassErr("Password must be at least 6 characters.");
      return;
    }
    setPassSaving(true);
    try {
      await axiosClient.post("/api/users/change-password", {
        currentPassword,
        newPassword,
      });
      setPassMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassMsg(""), 4000);
    } catch (err) {
      setPassErr(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPassSaving(false);
    }
  }

  const toggleDiscipline = (d) => {
    if (selectedDisciplines.includes(d)) {
      setSelectedDisciplines(selectedDisciplines.filter((x) => x !== d));
    } else {
      setSelectedDisciplines([...selectedDisciplines, d]);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-16 space-y-8">
      {/* Header Profile Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0E4B4C] text-2xl font-bold text-white shadow-xl shadow-[#0E4B4C]/25">
              {user?.name?.slice(0, 1) || "U"}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">{user?.name}</h1>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#D7F5DE] border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-[#0E4B4C]">
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
                <span className="rounded-md bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-medium">
                  📍 {district}, {block}
                </span>
                <span className="rounded-md bg-emerald-50 text-emerald-800 px-2 py-0.5 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forms Grid */}
      <div className="grid gap-8 lg:grid-cols-[65%_35%]">
        {/* Personal & Institutional Information */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User size={18} className="text-[#0E4B4C]" /> Account Details & Affiliations
          </h2>

          {profileMsg && (
            <div className="mt-4 rounded-xl bg-[#D7F5DE] border border-emerald-300 p-3 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2">
              <CheckCircle2 size={16} /> {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Full Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Phone Number
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none focus:border-[#0E4B4C]"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                District (Jharkhand)
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none focus:border-[#0E4B4C] bg-white"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Block / Municipality
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none focus:border-[#0E4B4C]"
                />
              </label>
            </div>

            {user?.role !== ROLES.REPORTER && (
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Institution / Corporate Enterprise
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm normal-case text-slate-900 outline-none focus:border-[#0E4B4C]"
                />
              </label>
            )}

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Biography / Professional Summary
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your academic or civic interests..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs normal-case text-slate-900 outline-none focus:border-[#0E4B4C] leading-relaxed"
              />
            </label>

            {/* University Disciplines Selector */}
            {user?.role === ROLES.UNIVERSITY && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <BookOpen size={14} /> Department Disciplines
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DISCIPLINES.map((d) => {
                    const active = selectedDisciplines.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          active
                            ? "bg-[#0E4B4C] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {active ? "✓ " : "+ "} {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition cursor-pointer"
              >
                <Save size={15} /> {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </section>

        {/* Security / Password */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <KeyRound size={16} className="text-[#0E4B4C]" /> Change Password
            </h2>

            {passMsg && (
              <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-300 p-2.5 text-xs font-semibold text-emerald-800">
                {passMsg}
              </div>
            )}
            {passErr && (
              <div className="mt-3 rounded-xl bg-rose-50 border border-rose-300 p-2.5 text-xs font-semibold text-rose-800">
                {passErr}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3.5 text-xs">
              <label className="block font-semibold text-slate-700">
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>

              <label className="block font-semibold text-slate-700">
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>

              <label className="block font-semibold text-slate-700">
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={passSaving}
                className="w-full rounded-xl border border-[#0E4B4C] bg-white py-2.5 text-xs font-bold text-[#0E4B4C] hover:bg-teal-50 transition cursor-pointer"
              >
                {passSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
