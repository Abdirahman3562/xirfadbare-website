import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Upload, Type, Image as ImageIcon, Layout, Move, Trash2, Eye, ShieldCheck, Origami, Globe, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateCertificate } from '../../../utils/pdfGenerator';

const CertificateBuilder = () => {
    const [templateId, setTemplateId] = useState(null);
    const [name, setName] = useState('Default Certificate');
    const [backgroundUrl, setBackgroundUrl] = useState('https://placehold.co/842x595/png?text=Certificate+Background');
    const [elements, setElements] = useState([]);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingElement, setUploadingElement] = useState(false);
    const [systemSettings, setSystemSettings] = useState(null);
    const [zoomScale, setZoomScale] = useState(1);
    const workspaceRef = useRef(null);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlId = searchParams.get('id');

    // Canvas dimensions (A4 Landscape at ~96 DPI, or proportional)
    const CANVAS_WIDTH = 842;
    const CANVAS_HEIGHT = 595;

    const bgInputRef = useRef(null);
    const elementImgInputRef = useRef(null);

    // Initial load & Precision Resize Listener
    useEffect(() => {
        if (urlId) {
            fetchTemplate();
        }
        fetchSystemSettings();

        const handleResize = () => {
            if (!workspaceRef.current) return;
            const container = workspaceRef.current;
            const padding = 48; // Space around the canvas
            const availW = container.clientWidth - padding;
            const availH = container.clientHeight - padding;

            // Calculate scale to fit while maintaining aspect ratio
            const scaleX = availW / CANVAS_WIDTH;
            const scaleY = availH / CANVAS_HEIGHT;

            // We want to fit it, but never exceed 100% size unless explicitly zoomed
            const newScale = Math.min(scaleX, scaleY, 1);
            setZoomScale(newScale);
        };

        handleResize();
        // Use ResizeObserver for more reliable container-based scaling
        const observer = new ResizeObserver(handleResize);
        if (workspaceRef.current) observer.observe(workspaceRef.current);

        return () => observer.disconnect();
    }, []);

    const fetchSystemSettings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/settings');
            const data = await res.json();
            setSystemSettings(data);
        } catch (error) {
            console.error('Error fetching system settings:', error);
        }
    };

    const fetchTemplate = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            // If urlId exists, fetch specific, otherwise fetch active
            const endpoint = urlId
                ? `http://localhost:5000/api/certificates/template/${urlId}`
                : 'http://localhost:5000/api/certificates/template';

            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data && !data.message) {
                setTemplateId(data._id);
                setName(data.name || 'Default Certificate');
                setBackgroundUrl(getFullImageUrl(data.backgroundUrl));
                // Ensure elements have a default fontFamily if missing
                const processedLayout = (data.layout || []).map(el => ({
                    ...el,
                    fontFamily: el.fontFamily || 'Inter'
                }));
                setElements(processedLayout);
            }
        } catch (error) {
            console.error('Error fetching template:', error);
            toast.error('Failed to load template');
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    const handleBackgroundUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            setBackgroundUrl(getFullImageUrl(data.url));
            toast.success('Background updated');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleElementImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploadingElement(true);

        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            const url = getFullImageUrl(data.url);

            addElement('image', null, url);
            toast.success('Signature/Stamp added');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
        } finally {
            setUploadingElement(false);
        }
    };

    const addElement = (type, field = null, src = null) => {
        const newElement = {
            id: `el-${Date.now()}`,
            type: field ? 'variable' : type,
            field: field,
            content: field ? `{${field.toUpperCase()}}` : (type === 'text' ? 'Double click to edit' : ''),
            src: src,
            x: 100,
            y: 100,
            width: type === 'image' || field === 'systemLogo' ? 100 : 200,
            height: type === 'image' || field === 'systemLogo' ? 100 : 40,
            fontSize: 16,
            fontWeight: 'normal',
            fontFamily: 'Inter',
            color: '#1e293b',
            textAlign: 'center',
        };

        if (field === 'systemLogo') {
            newElement.src = getFullImageUrl(systemSettings?.logo);
        }

        setElements([...elements, newElement]);
        setSelectedElementId(newElement.id);
    };

    const updateElement = (id, updates) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const saveTemplate = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('loggedInUser'))?.token;
            const payload = {
                id: templateId, // Use existing ID if we have it
                name: name,
                backgroundUrl: backgroundUrl,
                canvasWidth: CANVAS_WIDTH,
                canvasHeight: CANVAS_HEIGHT,
                layout: elements
            };

            const res = await fetch('http://localhost:5000/api/certificates/template', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                setTemplateId(data._id);
                toast.success('Template saved successfully!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        try {
            const mockData = {
                studentName: 'Abdirahman Mohamed',
                courseName: 'Full Stack Web Development',
                completionDate: new Date().toLocaleDateString(),
                instructorName: 'Engr. Samafale',
                certificateId: 'CERT-2026-0001',
                systemLogo: getFullImageUrl(systemSettings?.logo)
            };

            const template = {
                name,
                backgroundUrl,
                canvasWidth: CANVAS_WIDTH,
                canvasHeight: CANVAS_HEIGHT,
                layout: elements
            };

            await generateCertificate(template, mockData, 'preview-certificate.pdf');
            toast.info('Preview PDF Generated');
        } catch (error) {
            console.error('Preview error:', error);
            toast.error('Preview failed. Ensure all images are accessible.');
        }
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-gray-50 dark:bg-slate-900 overflow-hidden font-sans uppercase">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-wrap justify-between items-center shadow-sm z-10 shrink-0 px-8 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <Origami className="w-6 h-6 text-emerald-500" />
                        Builder
                    </h1>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 shrink-0 hidden md:block"></div>

                    {/* Template Name Input */}
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Certificate Name..."
                            className="bg-transparent border-none text-sm font-black text-gray-800 dark:text-white focus:ring-0 p-0 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                        <div className="h-[2px] w-full bg-emerald-500/20 rounded-full"></div>
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 shrink-0 hidden md:block"></div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => addElement('text')}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white border border-gray-200 dark:border-gray-600 rounded-xl transition-all"
                        >
                            <Type size={16} /> Text
                        </button>
                        <button
                            onClick={() => bgInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white border border-gray-200 dark:border-gray-600 rounded-xl transition-all"
                        >
                            <ImageIcon size={16} />
                            {uploading ? '...' : 'BG'}
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                        <button
                            onClick={() => elementImgInputRef.current?.click()}
                            disabled={uploadingElement}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                        >
                            <Origami size={16} />
                            {uploadingElement ? '...' : 'Signature / Stamp'}
                        </button>

                        <input type="file" ref={bgInputRef} onChange={handleBackgroundUpload} className="hidden" accept="image/*" />
                        <input type="file" ref={elementImgInputRef} onChange={handleElementImageUpload} className="hidden" accept="image/*" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border-2 border-emerald-100 active:scale-95 sm:flex"
                        onClick={handlePreview}
                    >
                        <Eye size={18} /> Preview
                    </button>
                    <button
                        onClick={saveTemplate}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                    >
                        <Save size={18} /> {loading ? '...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Dynamic Fields */}
                <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-5 overflow-y-auto shrink-0 z-10 scrollbar-hide">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Dynamic Fields</h3>

                    <div className="space-y-3">
                        {[
                            { field: 'systemLogo', label: 'System Logo', icon: Globe, color: 'text-blue-500' },
                            { field: 'studentName', label: 'Student Name', icon: Type, color: 'text-emerald-500' },
                            { field: 'courseName', label: 'Course Name', icon: Layout, color: 'text-purple-500' },
                            { field: 'completionDate', label: 'Date', icon: Move, color: 'text-orange-500' },
                            { field: 'instructorName', label: 'Instructor', icon: Type, color: 'text-rose-500' },
                            { field: 'certificateId', label: 'ID', icon: Type, color: 'text-blue-500' },
                        ].map(field => (
                            <button
                                key={field.field}
                                onClick={() => addElement('variable', field.field)}
                                className="w-full flex items-center gap-4 p-4 text-[11px] font-black text-gray-700 dark:text-gray-200 bg-gray-50/50 dark:bg-slate-700/30 hover:bg-emerald-600/10 dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-emerald-500/10 border border-gray-100 dark:border-gray-700 rounded-2xl transition-all text-left group"
                            >
                                <div className={`w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center ${field.color} shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all`}>
                                    <field.icon size={16} />
                                </div>
                                {field.label}
                            </button>
                        ))}
                    </div>

                    {selectedElement && (
                        <div className="mt-4 border-t-2 border-dashed border-gray-100 dark:border-gray-700 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Settings</h3>
                                <button onClick={() => removeElement(selectedElement.id)} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-90"><Trash2 size={16} /></button>
                            </div>

                            <div className="space-y-5">
                                {selectedElement.type !== 'image' && selectedElement.field !== 'systemLogo' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Content</label>
                                            <input
                                                type="text"
                                                value={selectedElement.content}
                                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                                className="w-full p-4 text-xs bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white font-black"
                                                disabled={selectedElement.type === 'variable'}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Size</label>
                                                <input
                                                    type="number"
                                                    value={selectedElement.fontSize}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                                    className="w-full p-4 text-xs bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-emerald-500 dark:text-white font-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Color</label>
                                                <div className="w-full p-1 bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-center">
                                                    <input
                                                        type="color"
                                                        value={selectedElement.color}
                                                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                                        className="w-full h-10 bg-transparent border-none cursor-pointer rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 ml-1">Style</label>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex gap-2">
                                                    <div className="flex-1 flex bg-gray-100/50 dark:bg-slate-900 rounded-2xl p-1.5 border-2 border-gray-50 dark:border-gray-700">
                                                        {['left', 'center', 'right'].map(align => (
                                                            <button
                                                                key={align}
                                                                onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                                                                className={`flex-1 py-1.5 text-[10px] font-black capitalize rounded-xl transition-all ${selectedElement.textAlign === align ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                {align[0]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                                        className={`px-5 rounded-2xl border-2 transition-all font-black text-xs ${selectedElement.fontWeight === 'bold' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                                                    >
                                                        B
                                                    </button>
                                                </div>

                                                {/* Font Family Dropdown */}
                                                <div>
                                                    <select
                                                        value={selectedElement.fontFamily || 'Inter'}
                                                        onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                                        className="w-full p-4 text-xs bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-emerald-500 dark:text-white font-black"
                                                    >
                                                        <option value="Inter">Inter (Modern)</option>
                                                        <option value="Helvetica">Helvetica (Standard)</option>
                                                        <option value="Courier">Courier (Typewriter)</option>
                                                        <option value="Times-Roman">Times New Roman (Classic)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(selectedElement.type === 'image' || selectedElement.field === 'systemLogo') && (
                                    <div className="bg-emerald-50/50 dark:bg-slate-900/50 p-5 rounded-3xl border-2 border-dashed border-emerald-200 dark:border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ImageIcon size={14} className="text-emerald-600" />
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Image Element</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm mb-3">
                                            <img src={selectedElement.src} alt="element" className="w-full h-32 object-contain rounded-xl" />
                                        </div>
                                        <p className="text-[9px] text-gray-400 text-center font-bold italic">Dimensions are proportional to resize handle.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Workspace / Canvas Area */}
                <div
                    ref={workspaceRef}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center relative shadow-inner"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                    }}
                >
                    {/* Centered Scaling Wrapper */}
                    <div
                        className="transition-all duration-500 ease-in-out flex items-center justify-center"
                        style={{
                            transform: `scale(${zoomScale})`,
                            transformOrigin: 'center center',
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                        }}
                    >
                        <div
                            className="relative bg-white shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-gray-200"
                            style={{
                                width: `${CANVAS_WIDTH}px`,
                                height: `${CANVAS_HEIGHT}px`,
                                backgroundImage: `url(${backgroundUrl})`,
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                            onClick={() => setSelectedElementId(null)}
                        >
                            {elements.map((el) => (
                                <Rnd
                                    key={el.id}
                                    scale={zoomScale}
                                    size={{ width: el.width, height: el.height }}
                                    position={{ x: el.x, y: el.y }}
                                    onDragStop={(e, d) => {
                                        updateElement(el.id, { x: d.x, y: d.y });
                                        setSelectedElementId(el.id);
                                    }}
                                    onResizeStop={(e, direction, ref, delta, position) => {
                                        updateElement(el.id, {
                                            width: parseInt(ref.style.width),
                                            height: parseInt(ref.style.height),
                                            ...position,
                                        });
                                        setSelectedElementId(el.id);
                                    }}
                                    bounds="parent"
                                    className={`group flex items-center ${selectedElementId === el.id ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-white shadow-2xl z-20' : 'hover:ring-1 hover:ring-emerald-300 z-10'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElementId(el.id);
                                    }}
                                >
                                    <div
                                        className="w-full h-full flex items-center cursor-move select-none break-words overflow-visible"
                                        style={{
                                            fontSize: `${el.fontSize}px`,
                                            fontWeight: el.fontWeight,
                                            color: el.color,
                                            justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                            textAlign: el.textAlign,
                                            fontFamily: el.fontFamily,
                                            whiteSpace: 'normal',
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        {(el.type === 'image' || el.field === 'systemLogo') ? (
                                            <img
                                                src={el.field === 'systemLogo' ? getFullImageUrl(systemSettings?.logo) : el.src}
                                                alt="layout element"
                                                className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
                                            />
                                        ) : (
                                            el.content
                                        )}
                                    </div>
                                </Rnd>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateBuilder;
