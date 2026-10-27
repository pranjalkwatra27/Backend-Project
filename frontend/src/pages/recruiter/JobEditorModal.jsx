import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { apiClient } from '../../api/client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const JobEditorModal = ({ isOpen, onClose, jobToEdit, onJobSaved }) => {
  const isEditing = Boolean(jobToEdit);

  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [minExp, setMinExp] = useState(2);
  const [maxExp, setMaxExp] = useState(5);
  const [ctcMin, setCtcMin] = useState(15);
  const [ctcMax, setCtcMax] = useState(25);
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [deadline, setDeadline] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title || '');
      setRole(jobToEdit.role || '');
      setDepartment(jobToEdit.department || 'Engineering');
      setLocation(jobToEdit.location || '');
      setWorkMode(jobToEdit.workMode || 'Hybrid');
      setMinExp(jobToEdit.minExp || 0);
      setMaxExp(jobToEdit.maxExp || 5);
      setCtcMin(jobToEdit.ctcRange?.min || 10);
      setCtcMax(jobToEdit.ctcRange?.max || 20);
      setSkills(Array.isArray(jobToEdit.skills) ? jobToEdit.skills.join(', ') : '');
      setDescription(jobToEdit.description || '');
      setRequirements(Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join('\n') : '');
      setResponsibilities(
        Array.isArray(jobToEdit.responsibilities) ? jobToEdit.responsibilities.join('\n') : ''
      );
      setDeadline(jobToEdit.deadline ? new Date(jobToEdit.deadline).toISOString().split('T')[0] : '');
    } else {
      // Defaults for new job
      setTitle('');
      setRole('');
      setDepartment('Engineering');
      setLocation('Bangalore, India');
      setWorkMode('Hybrid');
      setMinExp(2);
      setMaxExp(6);
      setCtcMin(18);
      setCtcMax(30);
      setSkills('React, Node.js, TypeScript, Express');
      setDescription('');
      setRequirements('');
      setResponsibilities('');
      setDeadline('');
    }
    setErrorMessage(null);
  }, [jobToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !skills.trim() || !location.trim()) {
      setErrorMessage('Please fill in all mandatory fields: Title, Location, Skills, and Description.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      role: role.trim() || title.trim(),
      department,
      location: location.trim(),
      workMode,
      minExp: Number(minExp),
      maxExp: Number(maxExp),
      ctcRange: {
        min: Number(ctcMin),
        max: Number(ctcMax),
        currency: 'INR',
        isPublic: true,
      },
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      description: description.trim(),
      requirements: requirements.split('\n').map((r) => r.trim()).filter(Boolean),
      responsibilities: responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
      deadline: deadline ? new Date(deadline) : undefined,
    };

    try {
      let res;
      if (isEditing) {
        res = await apiClient(`/jobs/${jobToEdit._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiClient('/jobs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        onJobSaved(res.job);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job Posting' : 'Publish New Job Opening'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lead Frontend Engineer"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Designation *</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Platform Architecture"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore, India"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring bg-white"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
            />
          </div>
        </div>

        {/* Experience & CTC */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Exp (Yrs)</label>
            <input
              type="number"
              min="0"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Exp (Yrs)</label>
            <input
              type="number"
              min="0"
              value={maxExp}
              onChange={(e) => setMaxExp(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min CTC (LPA)</label>
            <input
              type="number"
              min="1"
              value={ctcMin}
              onChange={(e) => setCtcMin(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max CTC (LPA)</label>
            <input
              type="number"
              min="1"
              value={ctcMax}
              onChange={(e) => setCtcMax(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Skills (comma-separated) *
          </label>
          <input
            type="text"
            required
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. React, Node.js, Express, MongoDB, Docker"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context regarding the engineering team, tech stack, and goals..."
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Key Requirements (One item per line)
          </label>
          <textarea
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="3+ years React experience&#10;Deep understanding of REST APIs&#10;Knowledge of MongoDB indexing"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {loading ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Opening'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
