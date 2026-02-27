import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Link, MessageSquare, Upload, X, Loader, CheckCircle, AlertCircle, Youtube } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

/**
 * SourceInputPanel Component
 *
 * Provides three input methods for the AI Quiz Generator:
 * - "Text Prompt"  : classic free-text prompt (existing behaviour)
 * - "Upload File"  : drag-and-drop / button upload for PDF, TXT, DOCX
 * - "Paste Link"   : URL input that fetches and extracts webpage text
 *
 * Props:
 *   - prompt         : string     – current text prompt value
 *   - onPromptChange : fn(str)    – called when text prompt changes
 *   - onSourceReady  : fn(str)    – called with extracted text from file/URL
 *   - sourceText     : string     – currently extracted source text (controlled)
 *   - onClearSource  : fn()       – called when source text is cleared
 */
function SourceInputPanel({ prompt, onPromptChange, onSourceReady, sourceText, onClearSource }) {
    // Active tab: "prompt" | "file" | "url"
    const [activeTab, setActiveTab] = useState("prompt");

    // File upload state
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);

    // URL state
    const [url, setUrl] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [urlSourceType, setUrlSourceType] = useState(null); // 'youtube_transcript' | 'youtube_description' | 'webpage' | null
    const [urlNotice, setUrlNotice] = useState(null);   // Optional notice from API (e.g. fallback warning)

    // Detect YouTube link for visual feedback
    const isYoutubeUrl = (u) => /(?:youtube\.com\/(?:watch|shorts|live|embed)|youtu\.be\/)/i.test(u);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const authHeaders = {
        Authorization: `Bearer ${token}`,
    };

    // ==============================
    //  TAB DEFINITIONS
    // ==============================
    const tabs = [
        { id: "prompt", label: "Text Prompt", icon: MessageSquare },
        { id: "file", label: "Upload File", icon: Upload },
        { id: "url", label: "Paste Link", icon: Link },
    ];

    // ==============================
    //  FILE UPLOAD HELPERS
    // ==============================
    const ACCEPTED_TYPES = [".pdf", ".txt", ".docx", ".doc"];
    const MAX_SIZE_MB = 5;

    const validateFile = (file) => {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        if (!ACCEPTED_TYPES.includes(ext)) {
            toast.error(`Unsupported file type. Please upload a PDF, TXT, or DOCX file.`);
            return false;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return false;
        }
        return true;
    };

    const handleFileSelect = (file) => {
        if (!validateFile(file)) return;
        setUploadedFile(file);
        onClearSource(); // Clear previous extracted text when a new file is selected
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleExtractFile = async () => {
        if (!uploadedFile) return;
        setIsExtracting(true);

        const formData = new FormData();
        formData.append("file", uploadedFile);

        try {
            const response = await axios.post(`${apiUrl}extract-file`, formData, {
                headers: {
                    ...authHeaders,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                onSourceReady(response.data.text);
                toast.success("Text extracted successfully!");
            } else {
                toast.error(response.data.message || "Failed to extract text from file.");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "An error occurred";
            toast.error(msg);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        onClearSource();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ==============================
    //  URL FETCH HELPER
    // ==============================
    const handleFetchUrl = async () => {
        if (!url.trim()) {
            toast.error("Please enter a URL.");
            return;
        }
        setIsFetching(true);
        setUrlNotice(null);

        try {
            const response = await axios.post(
                `${apiUrl}extract-url`,
                { url: url.trim() },
                { headers: { ...authHeaders, "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                const sourceType = response.data.source || 'webpage';
                const notice = response.data.notice || null;

                setUrlSourceType(sourceType);
                setUrlNotice(notice);
                onSourceReady(response.data.text);

                const successMsg = sourceType === 'youtube_transcript'
                    ? '🎬 YouTube transcript extracted!'
                    : sourceType === 'youtube_description'
                        ? '🎬 YouTube info extracted (no captions found).'
                        : '🔗 Page content extracted!';

                toast.success(successMsg);
            } else {
                toast.error(response.data.message || "Failed to fetch URL.");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "An error occurred";
            toast.error(msg);
        } finally {
            setIsFetching(false);
        }
    };

    // ==============================
    //  RENDER
    // ==============================
    return (
        <div className="space-y-3">

            {/* ===== TAB SWITCHER ===== */}
            <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 gap-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <motion.button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === id
                            ? "bg-white dark:bg-gray-800 text-purple-main dark:text-purple-light shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Icon size={13} />
                        <span className="hidden sm:inline">{label}</span>
                    </motion.button>
                ))}
            </div>

            {/* ===== TAB CONTENT ===== */}
            <AnimatePresence mode="wait">

                {/* --- TEXT PROMPT TAB --- */}
                {activeTab === "prompt" && (
                    <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                    >
                        <textarea
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            placeholder="e.g., Generate 5 questions about quadratic equations at different difficulty levels."
                            className="input-field w-full h-24 resize-none text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            💡 Be specific for better results.
                        </p>
                    </motion.div>
                )}

                {/* --- UPLOAD FILE TAB --- */}
                {activeTab === "file" && (
                    <motion.div
                        key="file"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-2"
                    >
                        {!uploadedFile ? (
                            /* DROP ZONE */
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${isDragging
                                    ? "border-purple-main bg-purple-main/10 scale-[1.02]"
                                    : "border-gray-300 dark:border-gray-600 hover:border-purple-main dark:hover:border-purple-light hover:bg-purple-main/5"
                                    }`}
                            >
                                <Upload size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Drop your file here or <span className="text-purple-main dark:text-purple-light">browse</span>
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    PDF, TXT, DOCX — max 5 MB
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt,.docx,.doc"
                                    className="hidden"
                                    onChange={handleFileInputChange}
                                />
                            </div>
                        ) : (
                            /* FILE SELECTED CARD */
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-purple-main flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                                        {uploadedFile.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {(uploadedFile.size / 1024).toFixed(0)} KB
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    >
                                        <X size={14} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Source text preview */}
                                {sourceText && (
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center gap-1 mb-1">
                                            <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                                Text extracted ({sourceText.length} chars)
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {sourceText.substring(0, 120)}…
                                        </p>
                                    </div>
                                )}

                                {!sourceText && (
                                    <motion.button
                                        type="button"
                                        onClick={handleExtractFile}
                                        disabled={isExtracting}
                                        className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: isExtracting ? 1 : 1.02 }}
                                        whileTap={{ scale: isExtracting ? 1 : 0.98 }}
                                    >
                                        {isExtracting ? (
                                            <><Loader size={13} className="animate-spin" /> Extracting…</>
                                        ) : (
                                            <><FileText size={13} /> Extract Text</>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            📄 The AI will base questions <strong>strictly</strong> on the uploaded document.
                        </p>
                    </motion.div>
                )}

                {/* --- PASTE LINK TAB --- */}
                {activeTab === "url" && (
                    <motion.div
                        key="url"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-2"
                    >
                        <div className="flex gap-2">
                            {/* YouTube badge */}
                            {isYoutubeUrl(url) && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex-shrink-0">
                                    <Youtube size={12} className="text-red-500" />
                                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">YouTube</span>
                                </div>
                            )}
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => { setUrl(e.target.value); onClearSource(); setUrlSourceType(null); setUrlNotice(null); }}
                                placeholder="https://youtube.com/watch?v=... or any webpage"
                                className="input-field flex-1 text-sm !mb-0"
                            />
                            <motion.button
                                type="button"
                                onClick={handleFetchUrl}
                                disabled={isFetching || !url.trim()}
                                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: isFetching ? 1 : 1.02 }}
                                whileTap={{ scale: isFetching ? 1 : 0.98 }}
                            >
                                {isFetching ? (
                                    <><Loader size={13} className="animate-spin" /> Fetching…</>
                                ) : (
                                    <><Link size={13} /> Fetch</>
                                )}
                            </motion.button>
                        </div>

                        {/* Extracted URL text preview */}
                        {sourceText && (
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1">
                                        {urlSourceType === 'youtube_transcript' && <Youtube size={12} className="text-red-500" />}
                                        {urlSourceType === 'youtube_description' && <Youtube size={12} className="text-orange-500" />}
                                        {urlSourceType === 'webpage' && <CheckCircle size={12} className="text-green-600 dark:text-green-400" />}
                                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                            {urlSourceType === 'youtube_transcript' && 'YouTube transcript extracted'}
                                            {urlSourceType === 'youtube_description' && 'YouTube info extracted (no captions)'}
                                            {urlSourceType === 'webpage' && 'Page content extracted'}
                                            {!urlSourceType && 'Content extracted'}
                                            {' '}({sourceText.length} chars)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { onClearSource(); setUrlSourceType(null); setUrlNotice(null); }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                                {urlNotice && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                                        <AlertCircle size={11} /> {urlNotice}
                                    </p>
                                )}
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {sourceText.substring(0, 120)}…
                                </p>
                            </div>
                        )}

                        {!sourceText && url && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                <AlertCircle size={12} />
                                Click "Fetch" to extract content from this URL.
                            </div>
                        )}

                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            🔗 Supports YouTube videos (with captions) and any public webpage.
                        </p>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}

export default SourceInputPanel;
