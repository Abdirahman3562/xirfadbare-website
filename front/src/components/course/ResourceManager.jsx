import React, { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Link as LinkIcon, Loader2, Plus, Paperclip } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';

const ResourceManager = ({ resources = [], onUpdate, label = "Resources" }) => {
    const [uploading, setUploading] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', fileUrl: '', fileType: 'file' });
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            const fileUrl = data.url || data.image;
            const fileType = file.name.split('.').pop();
            const title = newResource.title || file.name;

            // Automatically add resource to the list
            const resourceToAdd = {
                title,
                fileUrl,
                fileType
            };

            onUpdate([...resources, resourceToAdd]);

            // Clear inputs
            setNewResource({ title: '', fileUrl: '', fileType: 'file' });
            toast.success("File uploaded and added successfully");
        } catch (error) {
            console.error(error);
            toast.error("File upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAdd = () => {
        if (!newResource.title || !newResource.fileUrl) {
            toast.warning("Please provide both a title and a file/URL");
            return;
        }

        const updatedResources = [...resources, newResource];
        onUpdate(updatedResources);
        setNewResource({ title: '', fileUrl: '', fileType: 'file' });
    };

    const handleDelete = (index) => {
        const updatedResources = resources.filter((_, i) => i !== index);
        onUpdate(updatedResources);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</h3>

            {/* List of Resources */}
            <div className="space-y-2">
                {resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-gray-600 group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                {resource.fileType === 'url' ? <LinkIcon size={14} /> : <FileText size={14} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{resource.title}</p>
                                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block">
                                    {resource.fileUrl}
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Resource */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 border border-dashed border-gray-200 dark:border-gray-600 space-y-3">
                <input
                    type="text"
                    placeholder="Resource Title (e.g. Source Code)"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-emerald-500"
                />

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="File URL or Upload File"
                        value={newResource.fileUrl}
                        onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value, fileType: 'url' })}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-2 bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                        title="Upload File"
                    >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                    </button>
                </div>

                <button
                    onClick={handleAdd}
                    disabled={!newResource.title || !newResource.fileUrl || uploading}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Plus size={14} />
                    Add Resource
                </button>
            </div>
        </div>
    );
};

export default ResourceManager;
