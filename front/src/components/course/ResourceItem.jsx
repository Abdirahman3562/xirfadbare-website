import React, { useState } from 'react';
import { FileText, Link as LinkIcon, Download, ExternalLink, Loader2 } from 'lucide-react';
import { SERVER_URL } from '../../config';

const ResourceItem = ({ resource }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const isUrl = resource.fileType === 'url';
    const isPDF = resource.fileType?.toLowerCase() === 'pdf';
    const isZip = ['zip', 'rar', '7z'].includes(resource.fileType?.toLowerCase());

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const handleDownload = async (e) => {
        if (isUrl) return; // Let URLs open in new tab naturally
        e.preventDefault();

        try {
            setIsDownloading(true);
            const fullUrl = getFullUrl(resource.fileUrl);
            const response = await fetch(fullUrl);
            const blob = await response.blob();

            // Create temporary link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract extension from original URL if possible
            const originalExt = resource.fileUrl.split('.').pop().split(/[?#]/)[0];
            const fileName = `${resource.title || 'resource'}.${originalExt}`;

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to normal opening if blob fails
            window.open(getFullUrl(resource.fileUrl), '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    const getFileIcon = () => {
        if (isDownloading) return <Loader2 size={18} className="text-emerald-500 animate-spin" />;
        if (isUrl) return <LinkIcon size={18} className="text-blue-500" />;
        if (isPDF) return <FileText size={18} className="text-red-500" />;
        if (isZip) return <FileText size={18} className="text-amber-500" />;
        return <Download size={18} className="text-emerald-500" />;
    };

    const fullUrl = getFullUrl(resource.fileUrl);

    return (
        <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={!isUrl ? handleDownload : undefined}
            className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 group hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all duration-300 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
        >
            <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                    {getFileIcon()}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {resource.title}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mt-0.5">
                        {isDownloading ? 'Downloading...' : isUrl ? 'Resource Link' : `${resource.fileType || 'file'} resource`}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : isUrl ? <ExternalLink size={14} /> : <Download size={14} />}
            </div>
        </a>
    );
};

export default ResourceItem;
