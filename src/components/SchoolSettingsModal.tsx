import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { SchoolInfo } from '../types';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
  onSave: (info: SchoolInfo) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  onSave
}) => {
  const [formData, setFormData] = useState<SchoolInfo>(schoolInfo);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-stone-300">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                विद्यालय तथा प्रमाणीकरण विवरण
              </h2>
              <p className="text-xs text-stone-500">
                भर्पाई तथा प्रिन्टमा देखिने विद्यालय र पदाधिकारीहरूको विवरण
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              विद्यालयको नाम
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ठेगाना (वडा र स्थान)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                गाउँ/नगरपालिका
              </label>
              <input
                type="text"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                जिल्ला
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded"
              />
            </div>
          </div>

          <div className="border-t border-stone-200 pt-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              प्रमाणीकरण गर्ने पदाधिकारीहरू (हस्ताक्षरकर्ता)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  प्रधानाध्यापकको नाम (स्वीकृत गर्ने)
                </label>
                <input
                  type="text"
                  value={formData.headmasterName}
                  onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  लेखापाल / तयारकर्ताको नाम
                </label>
                <input
                  type="text"
                  value={formData.accountantName}
                  onChange={(e) => setFormData({ ...formData, accountantName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  जाँच / रुजु गर्ने (वि.व्य.स. अध्यक्ष / संयोजक)
                </label>
                <input
                  type="text"
                  value={formData.inspectorName || ''}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  placeholder="विद्यालय व्यवस्थापन समिति अध्यक्ष"
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>सुरक्षित गर्नुहोस्</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
