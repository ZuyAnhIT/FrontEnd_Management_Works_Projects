"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Save, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiTag, Tag } from "@/services/apiTag";
import { useToast } from "@/components/ui/ToastProvider";

// Preset colors similar to Jira/Trello
const PRESET_COLORS = [
    "#94a3b8", // Slate (Default)
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#d946ef", // Fuchsia
    "#ec4899"  // Pink
];

interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tag: Tag | null;
    companyId: number;
    workspaceId: number;
    projectId: number;
    onUpdate: (updatedTag: Tag) => void; // Callback when updated
    onDelete: (tagId: number) => void;   // Callback when deleted
}

export default function TagModal({
    isOpen,
    onClose,
    tag,
    companyId,
    workspaceId,
    projectId,
    onUpdate,
    onDelete
}: TagModalProps) {
    const { showToast } = useToast();

    // State for Edit Form
    const [tagName, setTagName] = useState("");
    const [tagColor, setTagColor] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // State for Delete Confirmation
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    // Reset state when opening modal with a tag
    useEffect(() => {
        if (isOpen && tag) {
            setTagName(tag.name);
            setTagColor(tag.color || "#94a3b8");
            setIsDeleteMode(false);
            setDeleteConfirmation("");
        }
    }, [isOpen, tag]);

    if (!isOpen || !tag) return null;

    // --- HANDLERS ---

    const handleSave = async () => {
        if (!tagName.trim()) {
            showToast("Tag name is required", "error");
            return;
        }

        try {
            setIsLoading(true);
            const updatedTag = await apiTag.updateTag(companyId, workspaceId, projectId, tag.id, {
                name: tagName.trim(),
                color: tagColor,
                description: tag.description
            });
            onUpdate(updatedTag);
            showToast("Tag updated successfully", "success");
            onClose();
        } catch (error) {
            console.error(error);
            showToast("Failed to update tag", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation.toLowerCase() !== "delete") return;

        try {
            setIsLoading(true);
            await apiTag.deleteTag(companyId, workspaceId, projectId, tag.id);
            onDelete(tag.id);
            showToast("Tag deleted permanently", "success");
            onClose();
        } catch (error) {
            console.error(error);
            showToast("Failed to delete tag (it might be in use)", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* HEADER */}
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700 text-sm">
                        {isDeleteMode ? "Delete Tag?" : "Edit Tag"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-4">
                    {!isDeleteMode ? (
                        // --- MODE: EDIT ---
                        <>
                            {/* Preview Tag */}
                            <div className="flex justify-center mb-4">
                                <div 
                                    className="px-3 py-1.5 rounded text-sm font-medium text-white transition-all shadow-sm"
                                    style={{ backgroundColor: tagColor }}
                                >
                                    {tagName || "Tag Name"}
                                </div>
                            </div>

                            {/* Input Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Tag Name</label>
                                <Input 
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    placeholder="Enter tag name..."
                                    autoFocus
                                />
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setTagColor(color)}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${tagColor === color ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    {/* Custom Color Input (Hidden logic but showing current hex) */}
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-300">
                                        <input 
                                            type="color" 
                                            value={tagColor}
                                            onChange={(e) => setTagColor(e.target.value)}
                                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                                        />
                                        <div className="w-full h-full" style={{backgroundColor: tagColor}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2 justify-between">
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsDeleteMode(true)}>
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete Tag
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // --- MODE: DELETE CONFIRMATION ---
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <div className="bg-red-50 p-4 rounded-md flex gap-3 border border-red-100">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                <div className="text-sm text-red-800">
                                    <p className="font-bold">This action cannot be undone!</p>
                                    <p className="mt-1 text-xs">Tag <strong>"{tag.name}"</strong> will be permanently removed from the project and unassigned from all tasks using it.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">
                                    Type <strong>delete</strong> to confirm:
                                </label>
                                <Input 
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="delete"
                                    className="border-red-300 focus-visible:ring-red-500"
                                />
                            </div>

                            <div className="pt-2 flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setIsDeleteMode(false)}>Back</Button>
                                <Button 
                                    size="sm" 
                                    className="bg-red-600 hover:bg-red-700 text-white" 
                                    onClick={handleDelete} 
                                    disabled={deleteConfirmation.toLowerCase() !== "delete" || isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                                    Confirm Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}