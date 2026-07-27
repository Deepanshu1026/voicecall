import { useState, useEffect, useRef } from 'react';
import { employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiDocumentText, HiPlus, HiPencilSquare, HiTrash, HiXMark, HiCheck, HiQueueList } from 'react-icons/hi2';

const TemplatePicker = ({ onSelect, isOpen, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const panelRef = useRef(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getTemplates();
      setTemplates(res.data?.data?.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSelect = (template) => {
    onSelect(template.content);
    onClose();
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      const res = await employeeAPI.createTemplate({ title: form.title, content: form.content });
      const newTemplate = res.data?.data?.template;
      if (newTemplate) {
        setTemplates((prev) => [newTemplate, ...prev]);
      }
      setForm({ title: '', content: '' });
      setManageMode(false);
      toast.success('Template saved');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate || !form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      const res = await employeeAPI.updateTemplate(editingTemplate._id, { title: form.title, content: form.content });
      const updated = res.data?.data?.template;
      if (updated) {
        setTemplates((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      }
      setEditingTemplate(null);
      setForm({ title: '', content: '' });
      toast.success('Template updated');
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await employeeAPI.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const startEdit = (template) => {
    setEditingTemplate(template);
    setForm({ title: template.title, content: template.content });
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setForm({ title: '', content: '' });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full right-4 mb-2 z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
          <HiQueueList className="w-4 h-4 text-primary-600" />
          Message templates
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setManageMode((m) => !m)}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={manageMode ? 'Back to templates' : 'Manage templates'}
          >
            {manageMode ? <HiQueueList className="w-4 h-4" /> : <HiPencilSquare className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {manageMode ? (
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Template title"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={100}
            />
            <textarea
              placeholder="Template content"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              maxLength={2000}
            />
            <div className="flex gap-2">
              {editingTemplate ? (
                <>
                  <button onClick={handleUpdate} className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
                    <HiCheck className="w-4 h-4" /> Update
                  </button>
                  <button onClick={cancelEdit} className="btn-secondary text-sm py-2 flex items-center justify-center gap-1">
                    <HiXMark className="w-4 h-4" /> Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleCreate} className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
                  <HiPlus className="w-4 h-4" /> Add template
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 font-medium mb-2">Your templates</p>
            {templates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">No templates yet</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template._id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{template.title}</p>
                      <p className="text-xs text-gray-500 truncate">{template.content}</p>
                    </div>
                    <button
                      onClick={() => startEdit(template)}
                      className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <HiPencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-6 px-4">
              <HiDocumentText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No templates yet</p>
              <button
                onClick={() => setManageMode(true)}
                className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first template
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {templates.map((template) => (
                <button
                  key={template._id}
                  onClick={() => handleSelect(template)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 truncate">{template.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{template.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplatePicker;
